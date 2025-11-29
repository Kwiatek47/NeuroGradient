import time
import numpy as np
import pandas as pd
from scipy.signal import butter, filtfilt, iirnotch
import collections
from brainaccess.utils import acquisition
from brainaccess.core.eeg_manager import EEGManager

# --- DEVICE CONFIGURATION ---
DEVICE_NAME = "BA MINI 048"
CAP_CHANNELS = {
    0: "F3", 1: "F4",
    2: "C3", 3: "C4",
    4: "P3", 5: "P4",
    6: "O1", 7: "O2",
}
SFREQ = 250

# --- ALGORITHM CONFIGURATION ---
WINDOW_SECONDS = 5  # Reduced to 5s for faster responsiveness (30s is very slow for real-time)
UPDATE_INTERVAL = 0.5  # Check for data every 0.5 seconds
MAX_CHANGE = 0.2  # Smoothing factor
SKIP_SECONDS = 10 # Number of seconds to skip in the beggining


class RealTimeFocus:
    def __init__(self, window_seconds, sfreq):
        # Circular buffer to hold the last N seconds of data
        self.buffer_size = int(window_seconds * sfreq)
        self.buffer = collections.deque(maxlen=self.buffer_size)

        # Dynamic calibration variables
        self.min_mean_val = float('inf')
        self.max_mean_val = float('-inf')
        self.last_focus_value = 0.0
        self.initialized = False

    def process(self, new_data):
        """
        new_data: numpy array shape (n_channels, n_samples)
        """
        # 1. Calculate the mean absolute amplitude across ALL channels for each sample
        # Data shape is (8, n_samples).
        # axis=0 collapses the 8 channels into 1 average value per sample.
        global_activity = np.mean(np.abs(new_data), axis=0)

        global_activity_filtered = filter_eeg(global_activity)

        # 2. Add to buffer (extends the deque with the new 1D array)
        self.buffer.extend(global_activity_filtered)

        # 3. Check for warmup
        if len(self.buffer) < self.buffer_size:
            progress = len(self.buffer) / self.buffer_size * 100
            print(f"Calibrating buffer... {progress:.1f}%", end='\r')
            return None

        # --- FOCUS ALGORITHM ---
        window_array = np.array(self.buffer)

        # Calculate noise level (Mean Amplitude)
        current_mean = np.mean(window_array)

        # Dynamic calibration (Auto-ranging)
        if current_mean < self.min_mean_val:
            self.min_mean_val = current_mean
        if current_mean > self.max_mean_val:
            self.max_mean_val = current_mean

        # Avoid division by zero
        range_span = self.max_mean_val - self.min_mean_val
        if range_span == 0:
            norm_val = 0.5
        else:
            norm_val = (current_mean - self.min_mean_val) / range_span

        # Smooth changes (Low-pass filter)
        if self.initialized:
            norm_val = np.clip(norm_val,
                               self.last_focus_value - MAX_CHANGE,
                               self.last_focus_value + MAX_CHANGE)

        self.last_focus_value = norm_val
        self.initialized = True

        # Invert: Higher Amplitude (Noise) = Lower Focus
        # Output: 0.0 to 1.0 (where 1.0 is max focus)
        focus_score = 1.0 - norm_val

        # Remap to -1 (distracted) to 1 (focused)
        final_score = (focus_score * 2) - 1

        return final_score
    

def highpass_filter(data, fs, cutoff=1.0, order=4):
    nyquist = 0.5 * fs
    normal_cutoff = cutoff / nyquist
    b, a = butter(order, normal_cutoff, btype='high', analog=False)
    filtered_data = filtfilt(b, a, data)
    return filtered_data


def notch_filter(data, fs, notch_freq=50.0, Q=30.0):
    nyquist = 0.5 * fs
    w0 = notch_freq / nyquist  # Normalized frequency
    b, a = iirnotch(w0, Q)
    filtered_data = filtfilt(b, a, data)
    return filtered_data


def filter_eeg(eeg_data):
    # Filter using high pass filter at 1Hz
    eeg_data = highpass_filter(eeg_data, SFREQ)
    eeg_data = notch_filter(eeg_data, SFREQ)
    return eeg_data


def send_to_server(score):
    # Visualization bar
    bar_len = 20
    # Map -1..1 to 0..20
    pos = int((score + 1) / 2 * bar_len)
    pos = max(0, min(bar_len, pos))
    bar = "[" + "#" * pos + " " * (bar_len - pos) + "]"
    print(f"SCORE: {score:.3f} {bar}")


def main():
    processor = RealTimeFocus(WINDOW_SECONDS, SFREQ)
    eeg = acquisition.EEG()

    eeg_data = []
    focus_score_list = []

    print(f"Attempting to connect to {DEVICE_NAME}...")

    # Track how much data we have already processed
    processed_samples = 0

    with EEGManager() as mgr:
        eeg.setup(mgr, device_name=DEVICE_NAME, cap=CAP_CHANNELS, sfreq=SFREQ)
        eeg.start_acquisition()
        print("\n--- CONNECTED & STREAMING ---")
        time.sleep(2)  # Wait for buffer to fill a bit

        try:
            while True:
                # 1. Get the Raw MNE Object
                mne_raw = eeg.get_mne()

                # 2. Check how much total data is in the buffer
                total_samples = mne_raw.n_times

                if total_samples/SFREQ < SKIP_SECONDS:
                    continue

                # 3. Calculate how many NEW samples arrived since last loop
                new_sample_count = total_samples - processed_samples

                if new_sample_count > 0:
                    # 4. Extract ONLY the new data
                    # get_data(start=X) gives us data from index X to the end
                    new_data = mne_raw.get_data()

                    # Update our counter so we don't process this data again
                    processed_samples = total_samples

                    # 5. Process
                    score = processor.process(new_data)

                    eeg_data.extend(new_data.T.tolist())
                    focus_score_list.append(score)

                    if score is not None:
                        send_to_server(score)

                time.sleep(UPDATE_INTERVAL)

        except KeyboardInterrupt:
            print("\nInterrupted by user.")
        finally:
            print("Stopping acquisition...")
            eeg.stop_acquisition()
            try:
                mgr.disconnect()
            except Exception:
                pass
            eeg.close()

        #print(eeg_data)
        focus_score_df = pd.DataFrame(focus_score_list)
        eeg_data_df = pd.DataFrame(eeg_data)

        focus_score_df.to_csv("focus_scores.csv")
        eeg_data_df.to_csv("eeg_data.csv")


if __name__ == "__main__":
    main()