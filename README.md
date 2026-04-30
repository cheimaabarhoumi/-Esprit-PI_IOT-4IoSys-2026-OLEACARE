# OleaCare 

## Overview

OleaCare is an AI-powered smart agriculture platform designed to assist olive farmers by predicting olive oil **quality**, **quantity**, and **acidity** before harvest — giving farmers the information they need to make the right decisions at the right time.

The system combines IoT sensors deployed in the olive field, long-range wireless communication (LoRa), edge AI inference running on a Raspberry Pi, and a web platform with an integrated chatbot assistant that provides personalized recommendations to farmers.

This project was developed as part of a final academic project at **ESPRIT School of Engineering**, within the **IoSys (Internet of Systems)** specialization.

---

## Features

-  **Real-time sensor data collection** — atmospheric pressure, temperature, and light intensity measured directly in the olive field
-  **Olive image analysis** — YOLO-based computer vision model detects and analyses olive characteristics via a 5MP camera
-  **AI-powered predictions** — four machine learning models predict oil quality classification, yield (kg/tree), oil percentage, and acidity percentage
-  **Harvest timing recommendation** — system estimates the optimal harvest date based on sensor data and model outputs
-  **Chatbot assistant** — conversational interface that gives farmers personalized, actionable recommendations
-  **Live dashboard** — Angular-based web interface displaying all predictions, trends, and alerts
-  **Autonomous field node** — solar-compatible battery system (24V Li-ion + BMS + DC-DC converter) for outdoor deployment

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| Angular | Main web application framework |
| TypeScript | Language |
| REST API (HTTP) | Communication with backend |

### Backend

| Technology | Role |
|---|---|
| Node.js + Express | Main application server, REST API, routing |
| MongoDB | Database — stores sensor data, predictions, and user data |
| Python + Flask | AI inference service — exposes models via REST API |
| Edge Impulse | ML model export and optimization for Raspberry Pi deployment |
| Ultralytics YOLO | Computer vision model for olive image analysis |

### Hardware

| Component | Role |
|---|---|
| ESP32 TTGO (OLED) | Field node — reads sensors, transmits via LoRa |
| BME280 | Atmospheric pressure + temperature sensor |
| GY-30 | Light intensity sensor |
| Camera 5MP | Olive image capture (connected to Raspberry Pi) |
| LoRa 433 MHz | Long-range wireless communication |
| ESP32 (base station) | Receives LoRa packets, forwards via USB |
| Raspberry Pi 4 | Gateway — runs Flask, Node.js, MongoDB, and all AI models |
| RTC DS3231 | Real-time clock for accurate timestamping |
| 6× Li-ion 18650 | 24V battery pack for field node power |
| BMS 6S 15A | Battery protection circuit |
| DC-DC XL4015 | Voltage converter — 24V → 5V |

---

## Architecture

OleaCare follows a 4-layer IoT architecture:

```
[ Field Layer ]       Sensors (BME280, GY-30, Camera) + ESP32 TTGO
       ↓
[ Communication ]     LoRa 433 MHz → Base station ESP32 → USB → Raspberry Pi
       ↓
[ Processing ]        Flask API (AI inference) + Node.js (backend) + MongoDB
       ↓
[ Application ]       Angular dashboard + Chatbot assistant
```

**Data flow:**

1. BME280 and GY-30 sensors send data to ESP32 via I2C (pins 21 & 22)
2. ESP32 field node packages and transmits data over LoRa 433 MHz
3. Base station ESP32 receives the packet and forwards it to Raspberry Pi via USB serial
4. Raspberry Pi passes sensor values to Flask API (`POST /predict`)
5. Flask loads and runs all 4 AI models locally — returns predictions as JSON
6. Node.js receives predictions, saves everything to MongoDB, and serves results to Angular via REST API
7. Angular dashboard displays quality, quantity, acidity, and harvest date to the farmer
8. Chatbot (served via Flask) provides personalized recommendations based on results

**AI Models (deployed on Raspberry Pi via Edge Impulse):**

| Model file | Prediction |
|---|---|
| `classification_model.pkl` | Olive quality classification |
| `rendement_kg_arbre_model.pkl` | Yield in kg/tree |
| `taux_huile_pct_model.pkl` | Oil percentage |
| `acidite_pct_model.pkl` | Acidity percentage |
| `best.pt` (YOLO) | Visual olive detection from camera |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.9
- MongoDB (local or Atlas)
- Raspberry Pi 4 with Raspberry Pi OS
- Angular CLI

### Backend — Node.js

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and Flask API URL
npm run dev
```

### ML Service — Flask

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

> Flask runs on `http://localhost:5000` by default. The `/predict` endpoint accepts POST requests with sensor data as JSON.

### Frontend — Angular

```bash
cd frontend
npm install
ng serve
```

### Raspberry Pi setup

```bash
# Install ML dependencies on the Pi
pip install opencv-python ultralytics torch torchvision --break-system-packages
pip install edge-impulse-linux -f https://cdn.edgeimpulse.com

# Run Flask API
cd ml-service
python app.py

# Run Node.js backend
cd backend
npm start
```

---

## Academic Context

**Institution:** ESPRIT School of Engineering  
**Specialization:** IoSys — Internet of Systems  
**Level:** Engineering degree (Cycle ingénieur)  
**Domain:** Smart Agriculture / Edge AI / IoT  

This project explores the integration of embedded AI at the edge (Edge Impulse on Raspberry Pi), long-range wireless sensor networks (LoRa), and full-stack web development to build a real-world precision agriculture solution for Tunisian olive farmers.

---

## Contributors

| Name | Role |
|---|---|
| Cheima Barhoumi | Full stack development, AI integration, IoT prototype |

---

## Acknowledgments

- [ESPRIT School of Engineering](https://esprit.tn) — academic supervision and support
- [Edge Impulse](https://edgeimpulse.com) — ML model export and embedded deployment tools
- [Ultralytics](https://ultralytics.com) — YOLO model framework
- [Arduino / ESP32 community](https://github.com/espressif/arduino-esp32) — LoRa and sensor libraries
