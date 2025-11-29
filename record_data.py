import time
import os
from brainaccess.utils import acquisition
from brainaccess.core.eeg_manager import EEGManager

DEVICE_NAME = "BA MINI 048"
SAVE_FOLDER = "./data"

CAP_CHANNELS = {
    0: "F3", 1: "F4",
    2: "C3", 3: "C4",
    4: "P3", 5: "P4",
    6: "O1", 7: "O2",
}

def ensure_folder():
    if not os.path.exists(SAVE_FOLDER):
        os.makedirs(SAVE_FOLDER)


def main():
    ensure_folder()
    eeg = acquisition.EEG()

    print(f"Attempting to connect to {DEVICE_NAME}...")

    with EEGManager() as mgr:
        # setup
        eeg.setup(mgr, device_name=DEVICE_NAME, cap=CAP_CHANNELS, sfreq=250)
        eeg.start_acquisition()
        print("\n--- CONNECTED & RECORDING ---")
        print("The device is now streaming. We will mark specific events.")

        # Give the signal time to settle
        time.sleep(2)

        recording_active = True

        while recording_active:
            print("\n" + "=" * 30)
            print("COMMANDS:")
            print("Type a label ('focus', 'distracted')")
            print("Type 'exit' to save and quit.")
            print("=" * 30)

            label = input("Current Activity Label: ").strip()

            if label.lower() == 'exit':
                recording_active = False
                break

            try:
                duration = float(input(f"How many seconds to record '{label}'? "))
            except ValueError:
                print("Invalid number. Skipping.")
                continue

            print(f"\n>>> RECORDING: {label} for {duration} seconds...")
            print(">>> START")

            # 1. Send Marker Annotation to the EEG file
            eeg.annotate(label)

            # 2. Wait (Record)
            # print countdown
            time_left = duration
            while time_left > 0:
                print(f"Recording... {int(time_left)}s remaining", end='\r')
                time.sleep(1)
                time_left -= 1

            print("\n>>> STOP ")

        # --- TEARDOWN ---
        print("\nStopping acquisition...")
        eeg.get_mne()  # retrieve data from buffer
        eeg.stop_acquisition()

        # Save unique filename based on time
        filename = f"{SAVE_FOLDER}/session_{time.strftime('%Y%m%d_%H%M')}.fif"
        print(f"Saving data to {filename}...")
        eeg.data.save(filename)
        print("Save Successful!")

        # try to disconnect
        try:
            mgr.disconnect()
        except Exception:
            pass

    eeg.close()
    print("Session Ended.")


if __name__ == "__main__":
    main()