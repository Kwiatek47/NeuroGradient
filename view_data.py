"""
helper script to view the data in .fif format
"""
import mne
import matplotlib.pyplot as plt
import os

# find the most recent file in the data folder automatically
data_folder = './data'
files = [os.path.join(data_folder, f) for f in os.listdir(data_folder) if f.endswith('.fif')]

if not files:
    print("no data found")
    exit()

# get the newest file
latest_file = max(files, key=os.path.getctime)
print(f"Opening: {latest_file}")

# 2. load the data
raw = mne.io.read_raw_fif(latest_file, preload=True)

# 3. filtering the data
# between 1 and 40
raw.filter(1, 40)

# 4. plot the data
raw.plot(scalings='auto', duration=5, n_channels=8, block=True)
plt.show()