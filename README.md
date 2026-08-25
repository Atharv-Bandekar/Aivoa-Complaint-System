# AI-Powered Customer Complaint Management System

An enterprise-grade, AI-driven Quality Management System (QMS) module designed for the pharmaceutical industry (API & FDF). This application automates the intake, triage, and risk assessment of customer complaints using advanced LLM entity extraction and document parsing.

## 🚀 Features

* **Intelligent Document Parsing:** Drag-and-drop support for PDF, TXT, and EML files. Automatically extracts text using `PyPDF2` and native decoding.
* **Zero-Shot Entity Extraction:** Powered by **LangGraph** and **Groq (llama-3.3-70b-versatile)** to accurately map unstructured complaint narratives into a strict Pydantic JSON schema.
* **AI Risk Co-Pilot:** Automatically assesses and classifies Initial Severity, Priority, and Suggested Next Actions based on pharmaceutical domain knowledge.
* **Modern React UI:** Built with Tailwind CSS, featuring Redux state management, dynamic triage badging, and seamless error handling.
* **Enterprise Backend Architecture:** FastAPI backend refactored into a scalable layered architecture (Routers, Services, Schemas, Models).
* **Cloud Persistence:** Fully integrated with a PostgreSQL database via SQLAlchemy ORM for reliable data storage.

## 🛠️ Technology Stack

**Frontend:** React, Redux Toolkit, Tailwind CSS, Lucide React (Icons), Vite  
**Backend:** Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, psycopg2  
**AI Framework:** LangChain, LangGraph  
**LLM:** Groq API (`llama-3.3-70b-versatile`)  
**Database:** PostgreSQL (Supabase)  

---

## 🏗️ Project Architecture

To ensure separation of concerns and maintainability, the backend strictly follows a layered enterprise architecture:
* `/models` - SQLAlchemy database tables and connection pooling.
* `/schemas` - Pydantic models for strict data validation and LLM output parsing.
* `/services` - Business logic, including the LangGraph AI state machine.
* `/routers` - RESTful API endpoints.

### Data Flow

```mermaid
graph TD
    %% Frontend
    subgraph Frontend [React + Redux Toolkit]
        UI[User Interface]
        State[Redux Store]
        UI <-->|Updates| State
    end

    %% Backend
    subgraph Backend [FastAPI Enterprise Architecture]
        Router[API Routers]
        Service[Service Layer]
        Schema[Pydantic Schemas]
        Model[SQLAlchemy Models]
        
        Router -->|Delegates| Service
        Service -->|Validates| Schema
        Service -->|Maps to| Model
    end

    %% External & DB
    LLM[LangGraph + Groq LLM]
    DB[(PostgreSQL / Supabase)]

    %% Connections
    UI -->|HTTP POST| Router
    Service <-->|Prompt & Parse| LLM
    Model <-->|Read/Write| DB
```

---

## ⚙️ Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/aivoa-complaint-system.git
cd aivoa-complaint-system
```

### 2. Backend Setup

Navigate to the backend directory and set up your Python environment:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `/backend` directory and add your credentials:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://your_db_user:your_db_password@your_host:6543/postgres
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

*The backend will be running at `http://localhost:8000`. Database tables will auto-generate on startup.*

### 3. Frontend Setup

Open a new terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

*The frontend will be running at `http://localhost:5173`.*

---

## 🎥 Demonstration Video

[**Link to 5-10 Minute End-to-End Walkthrough Video**] *(https://drive.google.com/drive/folders/1_gqcftNNAySQ4DCDPmIyPJmtJwW0nEsM?usp=drive_link)*

The video covers:

1. System architecture and codebase walkthrough.
2. Live demonstration of document upload (PDF/TXT) and text-prompt extraction.
3. Demonstration of the dynamic AI triage state and PostgreSQL database persistence.

---

**Author:** Atharv Bandekar


