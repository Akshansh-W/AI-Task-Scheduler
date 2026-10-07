# Chronos AI Task Scheduler

Chronos is a task-planning web app that turns a deadline and a time estimate into an ordered work schedule. Create an account, add tasks, and track them through completion.

## Features

- Sign up and log in with MongoDB-backed accounts, bcrypt password hashing, and JWT authentication.
- Create tasks with deadlines, priority, estimated effort, focus window, dependencies, and planning instructions.
- Generate task portions with Gemini when `GEMINI_API_KEY` is configured.
- Continue scheduling without a Gemini key using the built-in local fallback planner. The fallback is not an AI model and does not contact Gemini.
- View remaining and completed work, update task status, and see schedule metrics.
- Optionally send email reminders for scheduled task portions.
- Responsive home, sign-up, and login screens.

## Tech Stack

- Frontend: React 19, Vite, JavaScript, CSS
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Authentication: bcryptjs and jsonwebtoken
- AI scheduling: Google Gemini API through `@google/genai`, with a local fallback
- Email: Nodemailer and SMTP

## Requirements

- Node.js 20 or newer
- MongoDB connection string (local MongoDB or MongoDB Atlas)
- A Gemini API key for Gemini-generated plans (optional; fallback scheduling works without it)

## Setup

1. Configure the backend environment:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`. `GEMINI_API_KEY` is optional. Set SMTP variables only if email reminders are needed.

2. Install backend dependencies and check the MongoDB connection:

```powershell
npm install
npm run check
```

3. Start the backend in that terminal:

```powershell
npm run dev
```

4. In a second terminal, install and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The development server proxies `/api` requests to the backend at `http://localhost:5000`.

## Environment Variables

| Variable          | Required | Purpose                                                     |
| ----------------- | -------- | ----------------------------------------------------------- |
| `MONGO_URI`       | Yes      | MongoDB connection string                                   |
| `JWT_SECRET`      | Yes      | Secret used to sign and verify login tokens                 |
| `PORT`            | No       | Backend port; defaults to `5000`                            |
| `FRONTEND_ORIGIN` | No       | Allowed browser origin; defaults to `http://localhost:5173` |
| `GEMINI_API_KEY`  | No       | Enables Gemini-generated task schedules                     |
| `GEMINI_MODEL`    | No       | Gemini model name; defaults to `gemini-2.5-flash`           |
| `EMAIL_HOST`      | No       | SMTP server for email reminders                             |
| `EMAIL_PORT`      | No       | SMTP port; defaults to `587`                                |
| `EMAIL_USER`      | No       | SMTP username                                               |
| `EMAIL_PASS`      | No       | SMTP password or provider app password                      |
| `EMAIL_FROM`      | No       | Optional sender address; defaults to `EMAIL_USER`           |
| `EMAIL_SECURE`    | No       | Set to `true` when SMTP requires a secure connection        |

Never commit `.env` or put secrets in frontend environment variables. The Gemini key is used by the backend only.

## API Overview

- `GET /api/health` checks that the API is responding.
- `POST /api/auth/signup` creates an account and returns a JWT.
- `POST /api/auth/login` authenticates an account and returns a JWT.
- `GET /api/tasks` lists tasks. Task routes require `Authorization: Bearer <token>`.
- `POST /api/tasks` creates a task and generates its schedule.
- `PATCH /api/tasks/:id/status` marks a task remaining or completed.
- `DELETE /api/tasks/:id` deletes a completed task.

Task data is currently shared across authenticated accounts rather than scoped to the account that created it.

## Project Layout

```text
backend/   Express API, MongoDB models, authentication, scheduling and email
frontend/  React application and task-planning interface
```
