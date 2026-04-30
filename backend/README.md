# AI Scheduler Backend

Node.js API for storing scheduler tasks in MySQL and generating task portions with Gemini.

## Setup

1. Create `backend/.env` from `.env.example`.
2. Add your MySQL credentials, `GEMINI_API_KEY`, and notification credentials.
3. Install dependencies:

```bash
npm install
```

4. Check MySQL configuration:

```bash
npm run check
```

5. Start the API:

```bash
npm run dev
```

The server creates the `ai_scheduler` database and required tables on startup if they do not already exist.

In development, the frontend proxies `/api` requests to `http://localhost:5000`.

SMS and email reminders are checked every minute. When a task portion reaches
its scheduled start time, the backend sends the enabled notifications.

Email uses Nodemailer with SMTP, so it can work for free with an email account
you already have. For Gmail, use an app password as `EMAIL_PASS`.

## Endpoints

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id/status`
