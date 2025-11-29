import mne
import pandas as pd
import numpy as np
import os

DATA_FOLDER = './data'

def main():
    # for the most recent .fif file
    try:
        files = [os.path.join(DATA_FOLDER, f) for f in os.listdir(DATA_FOLDER)
                 if f.endswith('.fif') and not f.endswith('cleaned.csv')]
        if not files:
            print("Error - no .fif files found")
            exit()

        # Pick the newest file
        fif_file = max(files, key=os.path.getctime)
        print(f"Processing file: {fif_file}")

    except Exception as e:
        print(f"Error finding files: {e}")
        exit()

    # Load Data
    raw = mne.io.read_raw_fif(fif_file, preload=True, verbose=False)

    # Apply Filters (Clean the signals)
    print("Applying Notch (50Hz) and Bandpass (1-40Hz) filters...")
    raw.notch_filter(50, verbose=False)
    raw.filter(1, 40, verbose=False)

    # Convert to DataFrame
    df = raw.to_data_frame(scalings=dict(eeg=1e6))

    # Labelling
    print("Mapping labels...")
    df['Label'] = 'unlabeled'  # default setup

    if raw.annotations:
        # sort by time
        events = []
        for annot in raw.annotations:
            events.append({
                'time': annot['onset'],
                'label': annot['description'],
                'duration': annot['duration']
            })

        # Sort by time just in case
        events.sort(key=lambda x: x['time'])

        print(f"   Found {len(events)} events.")


        for i, event in enumerate(events):
            start_time = event['time']
            label = event['label']

            if event['duration'] > 0:
                end_time = start_time + event['duration']
            else:

                if i + 1 < len(events):
                    end_time = events[i + 1]['time']
                else:
                    end_time = df['time'].max()

            print(f"   -> Label '{label}' applies from {start_time:.2f}s to {end_time:.2f}s")

            # add label
            mask = (df['time'] >= start_time) & (df['time'] <= end_time)
            df.loc[mask, 'Label'] = label

    else:
        print("error - no annotations found")

    # save to CSV
    csv_filename = fif_file.replace('.fif', '.csv')
    df.to_csv(csv_filename, index=False)

    print("\n" + "=" * 40)
    print(f"SAVED: {csv_filename}")
    print("=" * 40)

    labeled_data = df[df['Label'] != 'unlabeled']

if __name__ == "__main__":
    main()