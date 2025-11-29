import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from collections import deque

CSV_FILE_PATH = 'eeg_data.csv'
SAMPLE_RATE = 250
EPOCH_LENGTH = 1.0
SKIP_SECONDS = 0

CH_NAMES = ['P3', 'P4', 'F3', 'F4', 'C3', 'C4', 'O1', 'O2']


class AdaptiveLogProcessor:
    def __init__(self):
        # History of log std values for auto-calibration (120 epochs ~ 2 minutes)
        self.log_std_history = deque(maxlen=120)

        self.smoothed_score = 0.0
        self.alpha_smoothing = 0.2

        # COMBO SYSTEM (STRICT)
        self.focus_streak = 0.0
        self.streak_bonus_limit = 0.8
        self.bonus_growth_rate = 0.1

        self.stats = {
            "final_scores": [],
            "raw_scores": [],
            "bonuses": [],
            "log_noise": [],
            "timestamps": [],
            "labels": []
        }

    def process_epoch(self, epoch_data, timestamp, current_label):
        # Data Preparation
        try:
            numeric_data = epoch_data[CH_NAMES]
            data_array = np.nan_to_num(numeric_data.to_numpy(dtype=float)).T
        except (KeyError, ValueError):
            return 0.0

        # Channel volatility (standard deviation)
        std_val = np.std(data_array)

        if std_val <= 0: std_val = 1e-9

        log_noise = np.log10(std_val)

        self.log_std_history.append(log_noise)

        # auto calibration and scoring
        if len(self.log_std_history) < 10:
            base_score = 0.0
        else:
            min_log = np.percentile(self.log_std_history, 5)

            max_log = np.percentile(self.log_std_history, 95)

            if max_log <= min_log:
                dist_ratio = 1.0
            else:
                dist_ratio = (log_noise - min_log) / (max_log - min_log)
                dist_ratio = max(0.0, min(1.0, dist_ratio))

            # Map to score (-1.0 to 1.0)
            base_score = 1.0 - (2.0 * dist_ratio)

            # If score is greater than 0.5, we consider it "Almost Silence" and boost it
            if base_score > 0.5:
                base_score = 0.5 + (base_score - 0.5) * 1.5

            base_score = max(-1.0, min(1.0, base_score))

        # If score is good, increase combo
        if base_score > 0.5:
            self.focus_streak += 1.0  # +1 epoch

        # If score is very low, reset combo
        elif base_score < -0.2:
            self.focus_streak = 0.0

        # Otherwise, decay the streak
        else:
            self.focus_streak *= 0.8

        current_bonus = min(self.focus_streak * self.bonus_growth_rate, self.streak_bonus_limit)

        if base_score > 0:
            final_raw = base_score + current_bonus
        else:
            final_raw = base_score

        final_raw = max(-1.0, min(1.0, final_raw))

        self.smoothed_score = (final_raw * self.alpha_smoothing) + \
                              (self.smoothed_score * (1 - self.alpha_smoothing))

        self.stats["final_scores"].append(self.smoothed_score)
        self.stats["log_noise"].append(log_noise)
        self.stats["bonuses"].append(current_bonus)
        self.stats["timestamps"].append(timestamp)
        self.stats["labels"].append(current_label)

        return self.smoothed_score


def main():
    print("--- START ADAPTIVE LOG-VARIANCE ---")

    try:
        df = pd.read_csv(CSV_FILE_PATH)
        if 'Label' in df.columns: df.rename(columns={'Label': 'label'}, inplace=True)
        if 'label' not in df.columns: df['label'] = 'unlabeled'

        idx_cut = int(SKIP_SECONDS * SAMPLE_RATE)
        df = df.iloc[idx_cut:].reset_index(drop=True)

    except FileNotFoundError:
        return

    processor = AdaptiveLogProcessor()
    step = int(250 * 1.0)  # 1 second

    for i in range(0, len(df) - step, step):
        chunk = df.iloc[i: i + step]
        timestamp = i / 250.0
        try:
            lbl = chunk['label'].mode()[0]
        except:
            lbl = 'unlabeled'

        processor.process_epoch(chunk, timestamp, lbl)

    stats = processor.stats
    times = np.array(stats["timestamps"])
    final_scores = np.array(stats["final_scores"])
    log_noise = np.array(stats["log_noise"])
    labels = np.array(stats["labels"])
    bonuses = np.array(stats["bonuses"])

    if len(final_scores) == 0: return

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)

    label_colors = {
        'focus': '#d5f5e3', 'distracted': '#fadbd8',
        'relax': '#d6eaf8', 'unlabeled': '#f2f3f4'
    }

    def draw_bg(ax):
        if len(labels) > 0:
            start = 0
            cur = labels[0]
            for i in range(1, len(labels)):
                if labels[i] != cur:
                    c = label_colors.get(cur, 'white')
                    ax.axvspan(times[start], times[i], color=c, alpha=0.6, lw=0)
                    cur = labels[i]
                    start = i
            c = label_colors.get(cur, 'white')
            ax.axvspan(times[start], times[-1], color=c, alpha=0.6, lw=0)

    draw_bg(ax1)
    draw_bg(ax2)

    ax1.plot(times, final_scores, color='#27ae60', lw=2.5, label='Focus Score')
    ax1.plot(times, bonuses, color='#f39c12', ls='--', lw=1.5, label='Combo Bonus')
    ax1.axhline(0, color='gray', ls='--', alpha=0.5)
    ax1.legend(loc='upper right')
    ax1.set_title('End Score (1.0 = Max Focus)')
    ax1.set_ylim(-1.1, 1.1)

    ax2.plot(times, log_noise, color='#8e44ad', lw=1.5, label='Noise Level (Log Scale)')
    ax2.set_ylabel('Log(StdDev)')
    ax2.set_title('Inside Algorithm Noise Level (Lower is Better)')
    ax2.legend(loc='upper right')

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()