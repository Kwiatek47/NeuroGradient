import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

DATA_PATH = "data/eeg_data.csv"
SKIP_SECONDS = 10
T = 1 / 250  # Sample period
MAX_CHANGE = 0.2
CHANNEL = 'F4'
WINDOW_SIZE = 30  # seconds


def main():
    df = pd.read_csv(DATA_PATH, index_col="time")

    df = df[df.index > SKIP_SECONDS]

    window_size = int(WINDOW_SIZE / T)  # in number of samples

    channel_data = df[CHANNEL]

    n_windows = len(channel_data) // window_size

    mean_list = []
    for idx in range(n_windows):
        window = channel_data.iloc[idx * window_size:(idx + 1) * window_size]
        window_mean = np.mean(np.abs(window))

        mean_list.append(window_mean)

    min_mean_val = mean_list[0]
    max_mean_val = mean_list[0]
    focus_values = []

    for mean_val in mean_list:
        if mean_val < min_mean_val:
            min_mean_val = mean_val
        if mean_val > max_mean_val:
            max_mean_val = mean_val

        focus_value = (mean_val - min_mean_val) / (max_mean_val - min_mean_val + 1e-6)

        # Clip if change is too big
        if len(focus_values) > 0:
            focus_value = np.clip(focus_value, focus_values[-1] - MAX_CHANGE, focus_values[-1] + MAX_CHANGE)
        focus_values.append(focus_value)

    focus_values = -np.array(focus_values) * 2 + 1

    focus_values = np.repeat(focus_values, window_size)

    fig, ax = plt.subplots(figsize=(12, 6))
    x_len = len(focus_values)
    ax.plot(df.index[:x_len], focus_values)

    # Map each unique label to a color
    unique_labels = df['Label'].unique()
    color_map = {label: f'C{i % 10}' for i, label in enumerate(unique_labels)}

    prev_label = None
    start_idx = None

    for i, (idx, row) in enumerate(df.iterrows()):
        label = row['Label']
        if label != prev_label:
            if prev_label is not None:
                ax.axvspan(df.index[start_idx], idx, color=color_map[prev_label], alpha=0.2)
            start_idx = i
            prev_label = label

    # Fill the last segment
    if prev_label is not None:
        ax.axvspan(df.index[start_idx], df.index[-1], color=color_map[prev_label], alpha=0.2)

    patches = [mpatches.Patch(color=color_map[label], alpha=0.2, label=label) for label in unique_labels]
    ax.legend(handles=patches, title="Label", bbox_to_anchor=(1.01, 1), loc='upper left')
    ax.set_ylim(-1, 1)
    plt.show()


if __name__ == "__main__":
    main()