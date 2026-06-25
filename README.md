# BotDiary: AI-Powered Personal Calendar Assistant

An intelligent personal calendar assistant that combines natural-language scheduling, persistent conversation memory, voice input, and JWT-protected user accounts in a full-stack mobile application.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?logo=react&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-Function%20Calling-412991?logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Zep](https://img.shields.io/badge/Zep-Memory%20Layer-0B5FFF)

## Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Engineering Highlights](#engineering-highlights)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)

## About

BotDiary is a capstone project that addresses a common productivity problem: users often want to manage calendar events conversationally instead of navigating traditional form-based interfaces. This assistant allows authenticated users to create, update, delete, and retrieve calendar entries through chat and voice commands.

The system combines:

- A React Native frontend for mobile and web interaction
- A Flask API for authentication, event management, and transcription
- OpenAI function calling for natural-language intent extraction
- Zep for persistent conversational memory
- MySQL for structured user and event storage

## Key Features

- Natural-language calendar operations with OpenAI function calling
- Event CRUD flows with authenticated access control
- Conversation memory backed by Zep for context-aware responses
- Voice-to-text input using OpenAI Whisper transcription
- Timezone-aware scheduling logic centered on `Asia/Jerusalem`
- Event synchronization in the chat UI after create, update, and delete actions
- JWT-based session handling with secure token persistence on the client

## Architecture Overview

The project is organized as a multi-layer assistant pipeline:

1. The frontend captures user input from chat or microphone and sends it to the backend with a JWT bearer token.
2. The Flask API validates the token, loads user context, and forwards the request to the OpenAI chat model.
3. OpenAI function calling selects the appropriate calendar action such as `get_events`, `add_event`, `update_event`, or `delete_event`.
4. Zep stores conversation history and helps preserve short-term context across requests.
5. MySQL stores user accounts and structured calendar data.
6. The backend returns a normalized response plus refreshed event data so the React Native sidebar can stay in sync.

High-level flow:

```text
React Native UI
  -> Flask API with JWT
  -> OpenAI function calling
  -> Zep memory + MySQL event storage
  -> Structured response back to the client
```

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React Native, Expo, React, React Native Gifted Chat, Expo Secure Store, Expo AV |
| Backend | Python, Flask, Flask-CORS, Flask-JWT-Extended, Flask-SQLAlchemy |
| AI / NLP | OpenAI API, function calling, Whisper transcription, Zep memory |
| Data | MySQL, SQLAlchemy |
| Deployment | Docker, Docker Compose |
| Client Networking | Axios |

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- Docker and Docker Compose
- An OpenAI API key

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` with the required values:

```env
SQLALCHEMY_DATABASE_URI=mysql+mysqlconnector://user:password@localhost:3308/diary_bot
JWT_SECRET_KEY=replace_with_a_long_random_secret
OPENAI_API_KEY=your_openai_api_key
MYSQL_PASSWORD=your_mysql_root_password
```

Notes:

- `backend/config.py` loads environment variables from `.env`.
- The backend expects a MySQL database and reads the SQLAlchemy connection string from `SQLALCHEMY_DATABASE_URI`.
- The OpenAI client is initialized from `OPENAI_API_KEY`.

### 2. Start the Database and Zep Services

From the `backend` directory:

```bash
docker compose up -d
```

This starts:

- `mysql:8.0` for application data
- `zep-db` for Zep persistence
- `zep` for conversation memory

### 3. Run the Flask API

```bash
flask --app app run --debug
```

If you prefer running the module directly:

```bash
python app.py
```

The API listens on port `5000`.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` with the API base URL:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:5000/bot
```

Optional client-side values used by the app:

```env
EXPO_PUBLIC_AUTH_TOKEN=your_optional_token
```

Start the Expo app:

```bash
npm start
```

You can also launch a specific target:

```bash
npm run android
npm run ios
npm run web
```

### Environment Variables Summary

| Variable | Location | Purpose |
| --- | --- | --- |
| `SQLALCHEMY_DATABASE_URI` | Backend `.env` | MySQL connection string used by Flask-SQLAlchemy |
| `JWT_SECRET_KEY` | Backend `.env` | JWT signing key |
| `OPENAI_API_KEY` | Backend `.env` | OpenAI and Zep-assisted AI features |
| `MYSQL_PASSWORD` | Backend `.env` | Root password for the MySQL container |
| `EXPO_PUBLIC_API_URL` | Frontend `.env` | Base URL for chat and transcription API calls |
| `EXPO_PUBLIC_AUTH_TOKEN` | Frontend `.env` | Optional public token hook used by the client |

## Engineering Highlights

- JWT context propagation: authenticated routes derive the active user directly from the access token, reducing client-side trust assumptions.
- Conversation session management: Zep session keys are scoped per user, which keeps memory isolated across accounts.
- Timezone normalization: chat requests are converted into precise ISO 8601 values in `Asia/Jerusalem` before event lookup or mutation.
- Function-call guardrails: the bot layer validates missing `event_id` values and falls back to recent event context when necessary.
- Client-side session persistence: the mobile app stores JWTs with Expo Secure Store, while the web and mobile UIs consume the same API contract.

## Project Structure

```text
.
├── backend
│   ├── app.py
│   ├── config.py
│   ├── config.yaml
│   ├── docker-compose.yml
│   ├── init.sql
│   └── src
│       ├── functions
│       │   └── event_function.py
│       ├── models
│       │   ├── event_model.py
│       │   └── user_model.py
│       ├── repository
│       │   ├── auth_repo.py
│       │   ├── event_repo.py
│       │   └── user_repo.py
│       ├── routes
│       │   ├── auth_routes.py
│       │   ├── bot_routes.py
│       │   ├── event_routes.py
│       │   ├── transcription_routes.py
│       │   └── user_routes.py
│       └── services
│           ├── auth_service.py
│           ├── event_service.py
│           ├── transcription_service.py
│           └── user_service.py
└── frontend
    ├── App.js
    ├── app.json
    ├── babel.config.js
    ├── package.json
    └── src
        ├── components
        │   ├── CalendarSidebar.js
        │   ├── ChatCustomUI.js
        │   └── Header.js
        ├── constants
        │   ├── colors.js
        │   └── config.js
        ├── screens
        │   ├── ChatScreen.js
        │   └── LoginScreen.js
        └── services
            ├── audioService.js
            └── botApi.js
```

## Future Roadmap

- Add refresh-token support and explicit session revocation
- Introduce pagination and date-range filtering for large event histories
- Expand the assistant with recurring-event support
- Add push notifications and scheduled reminders
- Add automated tests for routes, services, and OpenAI function-calling flows
- Publish an OpenAPI specification for the backend
- Add containerized CI checks for linting, formatting, and test execution

