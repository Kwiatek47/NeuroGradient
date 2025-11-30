import time
import os
import numpy as np
import pandas as pd
import requests
import collections
from scipy.signal import welch, butter, filtfilt
from scipy.stats import percentileofscore
from brainaccess.utils import acquisition
from brainaccess.core.eeg_manager import EEGManager

# --- KONFIGURACJA URZĄDZENIA ---
DEVICE_NAME = "BA MINI 048"

# Skupienie najlepiej widać na płatach czołowych (F3, F4) i ciemieniowych (P3, P4)
CAP_CHANNELS = {
    0: "F3", 1: "F4",
    2: "C3", 3: "C4",
    4: "P3", 5: "P4",
    6: "O1", 7: "O2",
}

SFREQ = 250

# API_URL z zmiennej środowiskowej lub fallback (dla hosta użyj localhost)
API_URL = os.getenv("API_URL", "http://localhost:3001/api/focus-data")

# --- KONFIGURACJA ALGORYTMU ---
WINDOW_SECONDS = 4      # Dłuższe okno = stabilniejszy odczyt widma
UPDATE_INTERVAL = 0.2   # Częstsze aktualizacje dla płynności
BUFFER_HISTORY = 60     # Ile sekund historii pamiętać do autokalibracji (np. 60s)

class AdvancedFocusDetector:
    def __init__(self, window_seconds, sfreq):
        self.sfreq = sfreq
        self.buffer_len = int(window_seconds * sfreq)
        self.raw_buffer = collections.deque(maxlen=self.buffer_len)
        
        # Bufor historii WYNIKÓW (nie surowych danych) do normalizacji
        # Przechowujemy ostatnie X wyników, aby wiedzieć co jest "dużo" a co "mało" dla danego usera
        self.score_history = collections.deque(maxlen=int(BUFFER_HISTORY / UPDATE_INTERVAL))
        
        # Filtry pasmowoprzepustowe (Bandpass 1-40Hz) aby wyciąć zakłócenia DC i sieci
        self.b, self.a = butter(4, [1, 40], btype='bandpass', fs=sfreq)

    def pre_process(self, data):
        """Filtruje sygnał, usuwa składową stałą i szum."""
        # 1. Odjęcie średniej (DC Offset)
        data = data - np.mean(data, axis=0)
        
        # 2. Filtracja Butterworth (1-40Hz)
        # axis=0 bo filtfilt działa wzdłuż osi czasu
        try:
            filtered_data = filtfilt(self.b, self.a, data, axis=0)
        except Exception:
            # Fallback dla zbyt krótkich buforów na początku
            filtered_data = data
            
        return filtered_data

    def calculate_focus_ratio(self, data):
        """
        Oblicza wskaźnik skupienia bazując na Relative Power (Moc Względna).
        Wzór: Beta / (Theta + Alpha)
        """
        # Obliczamy PSD metodą Welcha
        nperseg = min(256, len(data))
        freqs, psd = welch(data, self.sfreq, nperseg=nperseg, axis=0)
        
        # Uśredniamy PSD po wszystkich kanałach (globalne skupienie)
        avg_psd = np.mean(psd, axis=1) # Teraz mamy (freqs,)
        
        # Definicje pasm [cite: 272]
        # Theta: 4-8 Hz, Alpha: 8-12 Hz, Beta: 12-30 Hz
        idx_theta = np.logical_and(freqs >= 4, freqs < 8)
        idx_alpha = np.logical_and(freqs >= 8, freqs < 12)
        idx_beta  = np.logical_and(freqs >= 12, freqs < 30)
        
        # Całkowita moc w paśmie 4-30Hz (do obliczenia mocy względnej)
        idx_total = np.logical_and(freqs >= 4, freqs < 30)
        total_power = np.sum(avg_psd[idx_total])
        
        if total_power == 0: return 0.0
        # Moce w pasmach
        power_theta = np.sum(avg_psd[idx_theta])
        power_alpha = np.sum(avg_psd[idx_alpha])
        power_beta  = np.sum(avg_psd[idx_beta])

        # RELATIVE Power  - odporne na różnice w grubości czaszki/włosów
        rel_theta = power_theta / total_power
        rel_alpha = power_alpha / total_power
        rel_beta  = power_beta  / total_power
        
        # Wskaźnik "Beta Ratio" (popularny w neurofeedbacku ADHD)
        # Wyższe = większe skupienie. Niskie = relaks/marzenie.
        epsilon = 1e-6
        focus_metric = rel_beta / (rel_theta + rel_alpha + epsilon)
        
        return focus_metric

    def process(self, new_data):
        # new_data shape: (n_channels, n_samples) -> transponujemy na (n_samples, n_channels)
        self.raw_buffer.extend(new_data.T)
        
        if len(self.raw_buffer) < self.buffer_len:
            print(f"Buffering... {len(self.raw_buffer)}/{self.buffer_len}", end='\r')
            return 0.0
        # Konwersja bufora do numpy array
        window_data = np.array(self.raw_buffer)
        
        # 1. Pre-processing (Filtracja)
        clean_data = self.pre_process(window_data)
        
        # 2. Obliczenie surowego wskaźnika
        raw_score = self.calculate_focus_ratio(clean_data)
        
        # 3. Dynamiczna Normalizacja (Percentile Rank)
        # To jest klucz do "dobrych wyników". Nie używamy sztywnych progów.
        # Sprawdzamy: "Jak ten wynik wypada na tle ostatnich 60 sekund tego użytkownika?"
        self.score_history.append(raw_score)
        
        if len(self.score_history) < 10:
            # Za mało danych do statystyki
            final_score = 0.0 
        else:
            # Zwraca wartość 0-100 (w którym percentylu jesteśmy)
            percentile = percentileofscore(self.score_history, raw_score)
            
            # Mapowanie 0-100 na -1.0 do 1.0 (dla Twojego frontendu)
            final_score = (percentile / 50.0) - 1.0
            
        return final_score

def send_to_server(score):
    payload = {"score": score, "timestamp": time.time()}
    try:
        requests.post(API_URL, json=payload, timeout=0.2)
        
        # Wizualizacja w konsoli
        bar_len = 20
        # Score jest od -1 do 1. Mapujemy na 0..20
        pos = int((score + 1) / 2 * bar_len)
        pos = max(0, min(bar_len, pos))
        bar = "█" * pos + "░" * (bar_len - pos)
        print(f"FOCUS: {score:.2f} |{bar}|")
        
    except Exception as e:
        print(f"Error sending to server: {e}")

def main():
    processor = AdvancedFocusDetector(WINDOW_SECONDS, SFREQ)
    eeg = acquisition.EEG()
    
    # Zarządzanie połączeniem z BrainAccess
    with EEGManager() as mgr:
        print(f"Connecting to {DEVICE_NAME}...")
        eeg.setup(mgr, device_name=DEVICE_NAME, cap=CAP_CHANNELS, sfreq=SFREQ)
        eeg.start_acquisition()
        print("Connected. Stabilizing signal (wait 5s)...")
        time.sleep(5) 
        
        processed_samples = 0
        
        try:
            while True:
                mne_raw = eeg.get_mne()
                # Pobieramy tylko NOWE dane, żeby nie przetwarzać w kółko tego samego
                total_samples = mne_raw.n_times
                
                if total_samples > processed_samples:
                    # Pobierz chunk nowych danych
                    new_data = mne_raw.get_data(start=processed_samples)
                    processed_samples = total_samples
                    
                    if new_data.shape[1] > 0:
                        score = processor.process(new_data)
                        send_to_server(score)
                
                time.sleep(UPDATE_INTERVAL)
                
        except KeyboardInterrupt:
            print("\nStopping...")
        finally:
            eeg.stop_acquisition()
            eeg.close()

if __name__ == "__main__":
    main()

