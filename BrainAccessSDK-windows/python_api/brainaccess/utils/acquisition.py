import time
import numpy as np
import collections
from brainaccess.utils import acquisition
from brainaccess.core.eeg_manager import EEGManager

# --- DEVICE CONFIGURATION ---
DEVICE_NAME = "BA MINI 048"
# We define 8 EEG channels.
# The device sends 12 channels total (8 EEG + 4 Aux/Accel).
# We will slice the data to keep only the first 8.
CAP_CHANNELS = {
    0: "F3", 1: "F4",
    2: "C3", 3: "C4",
    4: "P3", 5: "P4",
    6: "O1", 7: "O2",
}
SFREQ = 250

# --- ALGORITHM CONFIGURATION ---
WINDOW_SECONDS = 30  # Analysis window length
UPDATE_INTERVAL = 1.0  # How often to calculate new score
MAX_CHANGE = 0.2  # Smoothing factor


class RealTimeFocus:
    def __init__(self, window_seconds, sfreq):
        self.buffer_size = int(window_seconds * sfreq)
        self.buffer = collections.deque(maxlen=self.buffer_size)

        self.min_mean_val = float('inf')
        self.max_mean_val = float('-inf')
        self.last_focus_value = 0.0
        self.initialized = False

    def process(self, new_data):
        """
        new_data: numpy array (n_samples, n_channels)
        """
        # 1. Calculate global activity (average across 8 channels)
        # axis=1 means we average columns (channels) for each row (time sample)
        try:
            global_activity = np.mean(np.abs(new_data), axis=1)
        except Exception as e:
            print(f"Error in math processing: {e}")
            return None

        # 2. Add to buffer
        self.buffer.extend(global_activity)

        # 3. Check warmup
        if len(self.buffer) < self.buffer_size:
            progress = len(self.buffer) / self.buffer_size * 100
            print(f"Calibrating buffer... {progress:.1f}%", end='\r')
            return None

        # --- FOCUS ALGORITHM ---
        window_array = np.array(self.buffer)
        current_mean = np.mean(window_array)

        if current_mean < self.min_mean_val:
            self.min_mean_val = current_mean
        if current_mean > self.max_mean_val:
            self.max_mean_val = current_mean

        if self.max_mean_val == self.min_mean_val:
            norm_val = 0.5
        else:
            norm_val = (current_mean - self.min_mean_val) / (self.max_mean_val - self.min_mean_val + 1e-6)

        if self.initialized:
            norm_val = np.clip(norm_val,
                               self.last_focus_value - MAX_CHANGE,
                               self.last_focus_value + MAX_CHANGE)

        self.last_focus_value = norm_val
        self.initialized = True

        # Invert: 0 (silence) -> 1 (Focus), 1 (noise) -> -1 (Distracted)
        focus_score = -norm_val * 2 + 1

        return focus_score


def send_to_server(score):
    # Visualization bar
    bar_len = 20
    pos = int((score + 1) / 2 * bar_len)
    pos = max(0, min(bar_len, pos))
    bar = "[" + "#" * pos + " " * (bar_len - pos) + "]"
    print(f"SENDING DATA >> Port: 5000 | Score: {score:.3f} {bar}")


def main():
    processor = RealTimeFocus(WINDOW_SECONDS, SFREQ)

    eeg = acquisition.EEG()
    print(f"Attempting to connect to {DEVICE_NAME}...")

    with EEGManager() as mgr:
        eeg.setup(mgr, device_name=DEVICE_NAME, cap=CAP_CHANNELS, sfreq=SFREQ)
        eeg.start_acquisition()
        print("\n--- CONNECTED & STREAMING ---")
        time.sleep(2)

        # Variable to track how much data we have already processed
        last_processed_samples = 0

        try:
            while True:
                # 1. Get MNE Raw Object (Contains metadata + data)
                mne_raw = eeg.get_mne()

                # 2. Extract data as Numpy Array
                # Shape is usually (n_channels, n_total_samples) -> e.g. (12, 5000)
                full_data = mne_raw.get_data()

                # 3. Calculate how many NEW samples arrived
                total_samples = full_data.shape[1]
                new_samples_count = total_samples - last_processed_samples

                if new_samples_count > 0:
                    # 4. Extract ONLY new samples and ONLY first 8 channels (EEG)
                    # We ignore channels 8-11 (Accelerometer/Aux)
                    new_chunk = full_data[:8, last_processed_samples:]

                    # 5. Transpose to match processor expectation: (n_samples, n_channels)
                    new_chunk = new_chunk.T

                    # 6. Process
                    score = processor.process(new_chunk)

                    if score is not None:
                        send_to_server(score)

                    # Update pointer
                    last_processed_samples = total_samples

                time.sleep(UPDATE_INTERVAL)

        except KeyboardInterrupt:
            print("\nInterrupted by user.")
        except Exception as e:
            print(f"\nCritical Error: {e}")
        finally:
            print("Stopping acquisition...")
            eeg.stop_acquisition()
            try:
                mgr.disconnect()
            except Exception:
                pass
            eeg.close()


if __name__ == "__main__":
    main()