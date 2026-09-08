# 🎵 AuraNotes Pro

**AuraNotes** is a professional-grade AI musical transcription workstation. It captures audio input, extracts musical pitches using the ICASSP 2022 **Basic Pitch** model, and organizes them into a clean, bar-based English notation table.

---

## 🛠️ System Architecture

AuraNotes operates using a distributed architecture to ensure the heavy AI processing doesn't freeze the user interface:

1. **Frontend (React)**  
   - Manages the high-fidelity metronome, rhythmic count-in, and the real-time transcription table.

2. **API (Django)**  
   - Acts as the bridge, saving audio files and managing the database.

3. **Worker (Celery)**  
   - The "Brain" that runs pitch detection and rhythmic math in the background.

4. **Broker (Redis)**  
   - The messenger that passes tasks from Django to Celery.

---

## 🚦 Running the Application

To run AuraNotes, you must have **three terminal windows** open simultaneously.

### Prerequisites

> [!IMPORTANT]  
> Ensure your **Redis Server** is running in the background before starting the terminals.

---

### Terminal 1: The Backend (Django)

This terminal runs the API and serves the database.

```powershell
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

---

### Terminal 2: The AI Worker (Celery)

This terminal listens for new recordings and processes them.

**Note:** We use `--pool=solo` to ensure compatibility with Windows.

```powershell
cd backend
.\venv\Scripts\activate
celery -A config worker -l info --pool=solo
```

---

### Terminal 3: The Frontend (React)

This terminal runs the user interface.

```powershell
cd frontend
npm start
```

---

# 🎹 Workstation Features

## 1. Rhythmic Assistance Toggle

**Toggle ON**
- Clicking **Record** triggers a **Count-in (4, 3, or 6 beats)** synced to your BPM.
- The metronome continues playing during recording to keep the performance on the grid.

**Toggle OFF**
- Recording starts immediately and silently.

---

## 2.  Bar-Based Logic

The system divides notes into bars based on the **BPM** and **Time Signature** you select.

**Quantization**
- Any noise or glitch notes shorter than **0.1s** are automatically ignored.

**Consolidation**
- Repeating notes (e.g., a long hum detected as multiple short notes) are merged into a **single notation per bar** for better readability.

---

## 3. High-Quality Metronome

- **Main** → High-pitch accent (**1200Hz**) on the first beat of every measure.
- **Sub** → Standard mid-pitch (**600Hz**) for all other beats.

---

# 📂 Project Structure

```plaintext
├── backend/
│   ├── transcriber/
│   │   ├── tasks.py        # AI Processing & Rhythmic Math
│   │   ├── views.py        # API Endpoints
│   │   └── models.py       # Database Schema
│   └── config/             # Django Project Settings
│
└── frontend/
    ├── src/
    │   ├── App.tsx         # Main UI & Metronome Engine
    │   ├── services/       # API Communications
    │   └── hooks/          # Audio Recording Logic
    └── tailwind.config.js  # Styling Configuration
```

---


### Notes Not Dividing
Ensure you are **humming in sync with the metronome**, because bar division is **strictly time-based**.
