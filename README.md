# 🌳 NeuroGradient
<img width="546" height="419" alt="Main-Site" src="https://github.com/user-attachments/assets/1f51b06a-54fa-41da-bb27-9bf2343a471d" />

**NeuroGradient** is an innovative focus and time management application that uses neurofeedback from EEG devices to visualize concentration levels in real-time. The app combines proven flow state induction techniques with gamification, where your focus grows as a visual tree.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Troubleshooting](#-troubleshooting)

## ✨ Features
<img width="547" height="419" alt="Shop-Music" src="https://github.com/user-attachments/assets/727c892b-7481-4652-9de3-44cd9d68c385" />
<img width="546" height="420" alt="Rank" src="https://github.com/user-attachments/assets/79496246-f4a6-463e-adf8-aef302486568" />
<img width="544" height="358" alt="Calendar" src="https://github.com/user-attachments/assets/d38b7364-7d8e-41e8-8712-90501149023c" />
<img width="918" height="419" alt="INTRO" src="https://github.com/user-attachments/assets/6302c2a1-c0ba-4643-ae62-3b9996892723" />
<img width="919" height="417" alt="Friends-Forest" src="https://github.com/user-attachments/assets/e753a8c7-c80e-4e61-bd34-b85cee3e72ec" />

### 🎯 Main Features

- **Real-time Neurofeedback** - Visualization of focus level based on EEG device data
- **Visual Tree** - Tree grows and blooms depending on your concentration level
- **Gamification** - Seed system (currency), shop with items, and challenges
- **Activity Calendar** - Activity visualization like GitHub (contribution graph)

- **Statistics & Analytics** - Detailed charts and session statistics
- **Website Blocker** - Chrome extension to block distracting websites during sessions

### 🎨 Additional Features

- **Breathing Exercises** - Concentration support before sessions
- **Music & Atmosphere** - Calibrates your internal state to establish the optimal personal environment for deep focus.
- **Boosters** - Temporary enhancements for tree growth speed
- **Tree Views** - Different visual styles (Normal, Christmas tree, cherry blossom)
- **Achievements** - Badge system for various achievements
- **Leaderboard** - See your friends tree's collection
- **3D Map** - Visualization of planted trees on a map

## 🛠 Technologies

### Frontend
- **React 18.2.0** - UI Framework
- **React Three Fiber** - 3D Rendering
- **Three.js** - 3D Graphics
- **Canvas API** - Tree and chart drawing

### Backend
- **Node.js** - Runtime
- **Express** - Server framework
- **CORS** - Cross-origin request handling

### EEG Service
- **Python 3** - EEG signal processing
- **BrainAccess SDK** - EEG device integration
- **NumPy, SciPy** - Signal analysis
- **MNE-Python** - EEG data processing

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Chrome Extension** - Website blocker

## 📦 Installation

### Requirements

- **Node.js** 16+ and npm
- **Docker** and Docker Compose
- **Python 3.8+** (for EEG service)
- **EEG Device** (optional, e.g., BrainAccess BA MINI)

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd NeuroGradient
```

### Step 2: Install dependencies

#### Frontend
```bash
cd frontend
npm install
cd ..
```

#### Backend
```bash
cd backend
npm install
cd ..
```

#### EEG Service
```bash
pip install -r eeg-service/requirements.txt
```

## 🚀 Running the Application

### Option 1: Running with Docker (Recommended)

#### Start Backend and Frontend

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

#### Start EEG Service (on host machine)

The EEG service must run on the host machine (outside Docker) to access Bluetooth/USB devices.

**Windows:**
```bash
# Using batch script
run-eeg.bat

# Or directly
cd eeg-service
python main.py
```

**Linux/Mac:**
```bash
cd eeg-service
python main.py
```

**Note:** Make sure the backend is running before starting the EEG service. The service will check the connection and continue even if the backend is not available.

### Option 2: Local Development

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

#### Terminal 3 - EEG Service (optional)
```bash
cd eeg-service
python main.py
```

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

#### Backend
The backend uses default ports. You can change the port in `docker-compose.yml`.

#### EEG Service
```bash
# Windows PowerShell
$env:API_URL="http://localhost:3001/api/focus-data"
python eeg-service/main.py

# Linux/Mac
export API_URL="http://localhost:3001/api/focus-data"
python eeg-service/main.py
```

### EEG Device Configuration

Edit `eeg-service/main.py`:
```python
DEVICE_NAME = "BA MINI 048"
```

### Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

Detailed instructions: [chrome-extension/QUICK_START.md](chrome-extension/QUICK_START.md)

## 📁 Project Structure

```
NeuroGradient/
├── frontend/               # React application
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── GrowingTree.js  # Tree component
│   │   ├── Board3D.js      # 3D Map
│   │   └── IntroScreen.js  # Intro screen
│   ├── public/
│   │   └── music/          # Music files
│   └── package.json
│
├── backend/                # Express server
│   ├── server.js           # Main server
│   └── package.json
│
├── eeg-service/            # EEG service (Python)
│   ├── main.py             # Main script
│   └── requirements.txt
│
├── chrome-extension/       # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── blocked.html
│
├── docker-compose.yml      # Docker configuration
└── README.md               # This file
```

## 🎮 Usage

### Starting a Session

1. **Open the application** in your browser (http://localhost:3000)
2. **Click "Start Session"**
3. **Complete breathing exercises** (if enabled) - to prepare for focus
4. **Watch the tree** - it grows depending on your focus level
5. **End the session** - click "End Session"

### Shop and Items

- **Buy items** in the shop with seeds (currency)
- **Activate music/atmosphere** before or during sessions
- **Use boosters** for faster tree growth
- **Choose tree view** - different visual styles

### Configuration

Open **Settings** (gear icon) to:
- Set intro music
- Configure session (duration, auto-start, timer)
- Add blocked websites
- Select effects for session (only purchased items)

### Calendar

- **Open calendar** (calendar icon)
- **View activity** - colors like GitHub:
  - Gray = no activity
  - Light green = < 15 min
  - Green = 15-30 min
  - Dark green = 30-60 min
  - Darkest green = 60+ min
- **Click a day** to see details

### Challenges

- **Open Challenges** (target icon)
- **Complete challenges** to earn rewards
- **Claim rewards**

### Website Blocker

1. **Add URL** in Settings → Blocked Websites
2. **Start a session**
3. **Blocked websites** will be redirected to a blocking page

## 🔧 Troubleshooting

### Backend not responding

```bash
# Check logs
docker-compose logs backend

# Check if it's running
curl http://localhost:3001/api/health
```

### Frontend not loading

```bash
# Check logs
docker-compose logs frontend

# Check if port 3000 is free
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### EEG Service not connecting

1. **Check Bluetooth connection** - device must be paired
2. **Check device name** in `eeg-service/main.py`
3. **Check logs** - should show connection status
4. **Make sure backend is running** - `http://localhost:3001/api/health`

**Common errors:**

```bash
# If you see "Bluetooth not enabled"
# - Enable Bluetooth in system settings
# - Make sure EEG device is paired

# If you see "Connection refused"
# - Check if backend is running: docker-compose ps
# - Check backend logs: docker-compose logs backend

# If you see "Module not found" (e.g., brainaccess)
# - Install dependencies: pip install -r eeg-service/requirements.txt
# - If brainaccess is not in PyPI, check installation documentation
```

### Chrome Extension not blocking websites

1. **Check if extension is enabled** in `chrome://extensions/`
2. **Check if session is active** - extension only works during sessions
3. **Check extension console** - `chrome://extensions/` → Details → Service Worker
4. **Check if application is open** on `localhost:3000`

### Music not playing

1. **Check browser console** (F12) - there may be file loading errors
2. **Check if files exist** in `frontend/public/music/`
3. **Check autoplay policy** - some browsers require user interaction
4. **Check if item is purchased and activated**

### Calendar colors not visible

1. **Check if you have sessions in history** - colors only appear for days with activity
2. **Refresh the page** (F5)
3. **Check console** - there may be JavaScript errors

## 📊 Reward System

### Seeds (Currency)
- **1 seed = 1 minute of session**
- Can be spent in the shop on:
  - Music
  - Atmosphere
  - Boosters
  - Tree views
  - Trees to plant

### Achievements
- **First session** - 10 seeds
- **10 sessions** - 50 seeds
- **50 sessions** - 200 seeds
- **100 sessions** - 500 seeds
- **One hour of focus** - 100 seeds
- **3/7/30 day streak** - 75/200/1000 seeds
- **10/50 hours of study** - 150/500 seeds

### Challenges
Every week new challenges are available, e.g.:
- **Habit Builder** - 7 sessions per week → 100 seeds
- **Night Owl** - Session after 8 PM → 50 seeds
- **New Horizon** - 3 different views → Achievement
- **Absolute Focus** - 45+ min session → 75 seeds

## 🎨 Personalization

### Music
- Classical music
- Nature sounds
- Binaural beats
- Ambient space

### Atmosphere
- Candlelight
- Rain outside
- Fireplace

### Tree Views
- Normal tree
- Christmas tree
- Cherry blossom

## 📝 Developer Notes

### Adding New Items

Edit `frontend/src/App.js` - `shopItems` array:
```javascript
{
  id: 'unique_id',
  category: 'music|atmosphere|boost|view|tree',
  name: 'Name',
  price: 100,
  icon: '🎵',
  description: 'Description',
  effect: 'focus+10%',
  audioPath: '/music/file.mp3' // optional
}
```

### Adding New Challenges

Edit `frontend/src/App.js` - `challenges` array:
```javascript
{
  id: 'challenge_id',
  name: 'Challenge Name',
  description: 'Description',
  progress: currentProgress,
  target: targetValue,
  reward: 100,
  icon: '🎯',
  completed: false
}
```

### API Endpoints

#### Backend
- `POST /api/session/start` - Start session
- `POST /api/session/stop` - Stop session
- `POST /api/focus-data` - Send focus score data
- `GET /api/focus-data` - Get last focus score
- `GET /api/health` - Server status

## 🐳 Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Start only backend and frontend
docker-compose up --build backend frontend
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## 🐍 Running EEG Service

### Prerequisites

1. **Python 3.8+** installed
2. **Dependencies installed:**
   ```bash
   pip install -r eeg-service/requirements.txt
   ```
3. **Backend running** (optional, but recommended)

### Running the Service

#### Windows
```bash
# Option 1: Using batch script
run-eeg.bat

# Option 2: Directly
cd eeg-service
python main.py
```

#### Linux/Mac
```bash
cd eeg-service
python main.py
```

### Configuration

#### Device Name
Edit `eeg-service/main.py`:
```python
DEVICE_NAME = "BA MINI 048"
```

#### API URL
Set environment variable:
```bash
# Windows PowerShell
$env:API_URL="http://localhost:3001/api/focus-data"

# Linux/Mac
export API_URL="http://localhost:3001/api/focus-data"
```

### Verification

1. **Backend running?** Check: `http://localhost:3001/api/health`
2. **Frontend running?** Check: `http://localhost:3000`
3. **EEG sending data?** In the console you should see:
   ```
   FOCUS: 0.123 |████░░░░░░░░░░░░░░░░|
   ```

### Troubleshooting EEG Service

#### Error: "Bluetooth not enabled"
- Make sure Bluetooth is enabled in system settings
- Check if EEG device is paired

#### Error: "Connection refused" when sending data
- Check if backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

#### Error: Module not found (e.g., `brainaccess`)
- Install dependencies: `pip install -r eeg-service/requirements.txt`

#### Service continues without backend
- This is normal - the service will process data but not send it
- Start the backend to enable data transmission

## 🤝 Support

If you encounter problems:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Check browser console logs (F12)
3. Check Docker logs: `docker-compose logs`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Zuzanna Warchoł [GitHub](https://github.com/zoeblues)
- Antoni Kwiatek [GitHub](https://github.com/Kwiatek47)
- Filip Pawlicki [GitHub](https://github.com/filippawlicki)
- Mateusz Dobry [GitHub](https://github.com/MateuszDobry)
- Jakub Wilk [GitHub](https://github.com/PyroX2)

---

**NeuroGradient** - Grow with your focus 🌳✨
