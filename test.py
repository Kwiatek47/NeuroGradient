# fixed test.py

import matplotlib.pyplot as plt
import matplotlib
import time
import os

from brainaccess.utils import acquisition
from brainaccess.core.eeg_manager import EEGManager

matplotlib.use("TKAgg", force=True)

eeg = acquisition.EEG()

# electrode locations
cap: dict = {
    0: "F3", 1: "F4", 2: "C3", 3: "C4",
    4: "P3", 5: "P4", 6: "O1", 7: "O2",
}

# our device
device_name = "BA MINI 048"

# create data folder
if not os.path.exists('./data'):
    os.makedirs('./data')
    print("Created 'data' folder.")

# start EEG acquisition
with EEGManager() as mgr:
    print(f"Connecting to {device_name}...")
    eeg.setup(mgr, device_name=device_name, cap=cap, sfreq=250)

    # start acquiring data
    eeg.start_acquisition()
    print("Acquisition started")
    time.sleep(3)

    start_time = time.time()
    annotation = 1
    while time.time() - start_time < 5:
        time.sleep(1)
        # send annotation to the device
        print(f"Sending annotation {annotation} to the device")
        eeg.annotate(str(annotation))
        annotation += 1

    print("Stopping acquisition...")

    # get all eeg data
    eeg.get_mne()
    eeg.stop_acquisition()

    # sava data
    filename = f'./data/{time.strftime("%Y%m%d_%H%M")}-raw.fif'
    print(f"Saving data to {filename}...")
    eeg.data.save(filename)
    print("Data saved successfully")

    # try disconnect
    try:
        mgr.disconnect()
    except Exception as e:
        print(f"Bluetooth disconnect warning (safe to ignore if data saved): {e}")

# access raw mne
mne_raw = eeg.data.mne_raw

# data shape from numpy arrays
data, times = mne_raw.get_data(return_times=True)
print(f"Data shape: {data.shape}")

# close brainaccess library
eeg.close()

# plot
print("Plotting...")
try:
    # conversion to microvolts
    mne_raw.apply_function(lambda x: x*10**-6)
    # show data
    mne_raw.filter(1, 40).plot(scalings="auto", verbose=False)
    plt.show()
except Exception as e:
    print(f"Plotting error: {e}")