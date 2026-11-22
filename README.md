# PUBLIC NOTICE INTELLIGENCE AND EARLY-WARNING SYSTEM
### AI-Powered Smart Civic Information and Public Alert Platform

An end-to-end, production-ready civic technology platform that makes government public circulars, emergency warnings, water disruptions, traffic diversions, and scheme deadlines understandable, multilingual, location-matched, and timely for every citizen.

---

## 🌟 Key Architecture & System Components

1. **Responsive Government Web Administration Dashboard** (`/frontend`)
   - Admin Authentication & Role-Based Access
   - Notice Upload Module supporting PDFs (PyMuPDF), Scanned Images (OCR), and Text
   - AI Processing Inspector displaying confidence ratings, entity extraction, and category classification
   - Human Verification & Approval Workflow before broadcasting
   - Spatial Map GIS Visualizer for city-wide disruptions
   - Notification Dispatch & Analytics Dashboard

2. **Citizen Mobile Application** (`/mobile`)
   - Built with React Native & Expo (TypeScript)
   - Locality & Sector targeting (Kukatpally, Gachibowli, Madhapur, Secunderabad, etc.)
   - Emergency Red Alert banners for life-safety warnings
   - Multilingual translations (English, Telugu, Hindi)
   - Built-in Voice Assistant (Text-to-Speech) for accessibility
   - Citizen Feedback, Clarification, and Inaccuracy Reporting

3. **Central Shared Backend & AI Intelligence Engine** (`/backend`)
   - Python FastAPI high-performance REST APIs
   - SQLAlchemy ORM database models
   - OCR document text extraction (PyMuPDF & Tesseract)
   - Google Gemini API integration with resilient built-in Civic NLP fallback
   - Location Matching Engine linking notice impact zones to citizen preferences
   - Notification Gateway logging delivery status to push, web, email, and SMS channels

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup
```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Seed realistic demonstration dataset (water cut, red alert flood, traffic, scholarship, property tax)
python seed_data.py

# Launch FastAPI Backend
python run_server.py
# Server runs on: http://127.0.0.1:8000
# Interactive Swagger Documentation: http://127.0.0.1:8000/docs
```

### 2. Admin & Citizen Web Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development or preview server
npm run dev
# Or preview built production build:
npm run preview -- --port 5173
# Web application live on: http://localhost:5173
```

### 3. Citizen Mobile Application Setup
```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

---

## 🔑 Environment Variables Configuration

Copy `.env.example` in `backend/` to `.env`:
```env
DATABASE_URL=sqlite:///./civic_notices.db
# For PostgreSQL: postgresql://postgres:postgres@localhost:5432/civic_notices
SECRET_KEY=civic-notice-intelligence-secret-key-prod-2026
GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If `GEMINI_API_KEY` is not provided, the platform automatically activates its built-in rule-based civic NLP engine with high-precision entity extraction and Telugu/Hindi translations.*

---

## 🏆 End-to-End Workflow Demonstration

1. Open **http://localhost:5173** in your browser.
2. Click **Upload Official Notice** in the Admin Portal.
3. Select the pre-loaded **Water Cut (Kukatpally)** or **Red Alert (Rain & Flood)** template or upload your own PDF.
4. Click **Run AI Intelligence Engine**. Observe text parsing, categorization, urgency grading, deadline detection, and Telugu/Hindi translation.
5. Click **View in Dashboard & Verify**.
6. Click **Verify Notice** then **Publish & Broadcast Alerts**.
7. Switch to the **Citizen Portal** (top right switch).
8. View the alert matched directly to **Kukatpally** residents.
9. Click the notice, switch between **English**, **తెలుగు (Telugu)**, and **हिन्दी (Hindi)**, and click **Listen Now** to test text-to-speech narration!

