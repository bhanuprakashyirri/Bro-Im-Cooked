# BRO, I'M COOKED 💀
### Survive One College Class

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-orange.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Vanilla%20JS%2FCSS-brightgreen.svg)]()

> *"The goal of this prototype is to validate the core gameplay loop before building the full college simulator."*

A polished comedy browser game prototype where you play as an Indian college student trapped in a 5-minute Database Systems lecture. Balance your stats, pretend to take notes, dodge the professor's gaze, and survive until the bell rings without getting cooked.

---

## 🎮 Core Gameplay

The player sits at a backbench desk in **CS-302: Relational Database Systems** under the watchful eye of **Professor Verma**.

You have a visible countdown: **05:00** (5 real-time minutes, with simulation speed options 1x / 2x / 5x for testing).

### 📊 Vital Resources
* 🧠 **Sanity (100)**: Decreases during stressful study and awkward interrogations. If it drops to 0, your brain melts from DBMS normalization.
* 😴 **Energy (100)**: Drains steadily as lecture drags on. If it drops to 0, you pass out on the desk and snore loudly.
* 📊 **Attendance (85%)**: Minimum requirement is 75%. If it drops below 75%, you are instantly debarred!
* 💰 **Money (₹100)**: Used for emergency canteen samosas, chai, and Xerox favors.
* 👀 **Professor Suspicion (0% - 100%)**: Increases with risky actions. Reaching 100% triggers a confrontation.

---

## 🕹️ Interactive Actions

| Action | Effects | Tactical Purpose |
| :--- | :--- | :--- |
| **📖 STUDY** | Suspicion -5, Sanity -2, Energy -3 | Safe way to cool down suspicion, but drains your mental battery. |
| **💤 SLEEP** | Energy +10, Sanity +5, Suspicion +15 | Recharges energy quickly, but highly conspicuous if professor glances your way. |
| **📱 USE PHONE** | Sanity +8, Suspicion +25 | Browse memes under the desk. Great sanity boost, huge suspicion risk! |
| **💻 LOOK BUSY** | Suspicion -3, Sanity +2, Random Risk | Mash your keyboard furiously. 25% chance the professor notices your typing. |

---

## 👨‍🏫 Professor Suspicion & AI System

The professor moves dynamically between lecture states:
1. **Writing on Whiteboard**: Back turned toward students. Actions are safer and suspicion passively decays.
2. **Lecturing**: Facing the classroom and pacing the podium.
3. **Suspicious (50%+)**: Turns head toward backbenches and raises an eyebrow.
4. **Watching (75%+)**: Stares directly at the player. `⚠️ PROFESSOR IS WATCHING` alert flashes on screen.
5. **Caught (100%)**: Screen shakes, dramatic stinger plays, and Professor Verma walks directly to your desk!

### The Caught Confrontation 💀
When caught, the game pauses for interrogation:
> **Professor:** *"Very interesting. What exactly are you doing?"*

* **“Taking notes, sir.”** &mdash; Low chance of escape (25%)
* **“Nothing, sir.”** &mdash; Medium chance of escape (40%)
* **“I was checking the time.”** &mdash; High chance of failure (10% escape / 90% cooked)

If your defense succeeds, suspicion resets to 60% with a stern warning. If it fails, **YOU GOT COOKED 💀**.

---

## ⚡ Random Events

Includes at least 6 interactive classroom incidents:
1. **Pop Question**: Explain Boyce-Codd Normal Form on the spot.
2. **WhatsApp Ping**: Bunty asks if you want canteen samosas for ₹30.
3. **Emergency Call**: Mom calls in the middle of class! Timed quick-reaction choice.
4. **Surprise Roll Call**: Professor calls Roll 42! Shout **"PRESENT SIR!"** before the timer expires.
5. **Post-Lunch Coma**: Fight the sleepiness or surrender to the desk nap.
6. **Whisper Chain**: Bunty asks what sir just said. Divert attention to Sharma ji in the front row!
7. **Fly Intrusion**: A housefly tests your ninja reflexes.

---

## 🎨 Aesthetic & Design

* **Indie Color Palette**:
  * Background: `#F5F3EE`
  * Dark Text: `#171717`
  * Accent: `#FFB84D`
  * Danger: `#D95C5C`
  * Success: `#6FAF72`
* Stylized cartoon 2D Indian classroom with rotating ceiling fan blade shadows, blackboard notes, Topper Sharma taking notes, backbenchers sleeping, and animated player desk.
* Modern accessible dialogs with `@starting-style`, `transition-behavior: allow-discrete`, and smooth micro-animations.

---

## 🔊 Audio Engine

Pure **Web Audio API procedural sound synthesizer** &mdash; zero external audio files required, instant loading:
* Ceiling fan rhythmic aerodynamic hum
* Classroom ambient drone
* Tactile mechanical keyboard clicks and page scribbles
* WhatsApp chime and retro phone ringtone
* Dramatic "DUN-DUN-DUN" brass caught stinger
* Victory fanfare and defeat slide trombone

---

## 🚀 How to Run Locally

No build tools or node_modules needed! Simply open `index.html` in any modern web browser:

```bash
# Option 1: Double-click index.html or open with your browser
start index.html

# Option 2: Run a local static server
python -m http.server 3000
```
Then navigate to `http://localhost:3000/`.

---

## 🏆 End Game Titles

Surviving the class awards a custom reputation title based on your playstyle:
* **ACADEMIC WEAPON**
* **PROFESSIONAL BACKBENCHER**
* **SLEEPING BEAUTY OF CSE**
* **SUSPICIOUS INDIVIDUAL**
* **SOMEHOW ALIVE**
* **CANTEEN SPONSOR**

---

© 2026 Backbencher Studios &middot; Prototype for validation.
