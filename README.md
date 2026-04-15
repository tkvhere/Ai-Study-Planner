# AI Study Planner

AI Study Planner is a full-stack student guidance platform that helps learners choose a career path, take aptitude assessments, compare options, and build personalized study plans. The project combines a React frontend with an Express/MySQL backend and optional AI-powered guidance.

## Features

- Smart career recommendations based on marks, interests, and aptitude results
- Aptitude and personality assessment flow
- Multi-career comparison with score breakdowns
- College recommendation support
- Personalized study planner and progress tracking
- What-if analysis for changing marks and preferences
- Career detail pages with skills, salary outlook, and opportunities
- Student classroom dashboard with practice levels and curriculum tracking
- Animated landing page with sign in and sign up entry points

## Tech Stack

- Frontend: React, React Router-style navigation, CSS modules and custom animations
- Backend: Node.js, Express, CORS, MySQL
- Database: MySQL 8
- Dev tooling: Create React App, Docker, Docker Compose

## Project Structure

- `backend/` - Express API, database helpers, and persistence layer
- `my-app/` - React frontend application
- `docker-compose.yml` - Local multi-service setup for MySQL, backend, and frontend

## Getting Started

### Option 1: Docker Compose

This is the easiest way to run the full stack locally.

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Run Manually

Install dependencies for each app and start them in separate terminals.

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd my-app
npm install
npm start
```

The frontend uses `http://localhost:5000` as its API proxy by default.

## Available Scripts

### Frontend

From `my-app/`:

- `npm start` - run the React development server
- `npm test` - launch the test runner
- `npm run build` - create a production build
- `npm run eject` - expose the underlying Create React App configuration

### Backend

From `backend/`:

- `npm start` - start the Express server on port 5000

## Environment Variables

The backend supports optional AI provider settings for chat-based guidance.

- `CHAT_PROVIDER`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

When using Docker Compose, MySQL credentials are already set for local development.

## Notes

- The frontend is currently set up with a custom student-focused experience rather than the default CRA starter UI.
- User and progress data are stored through the backend layer, with MySQL available for local development.
- If you want, you can add screenshots, a live demo link, or a deployment section before publishing the repository.
