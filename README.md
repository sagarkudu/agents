# Agents AI — Frontend + Backend

Clean separation of the AI demo into two applications:

```text
agents-ai/
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── chat-completions.js
│   ├── package.json
│   ├── responses.js
│   └── server.js
├── frontend/
│   ├── app.js
│   ├── index.html
│   ├── package.json
│   └── style.css
├── package.json
└── README.md
```

## Why Vite and environment.js were removed

- The frontend is plain HTML/CSS/JavaScript, so Vite is not required.
- The OpenAI API key must stay on the backend.
- `environment.js` was replaced by the standard `dotenv` package.
- The frontend calls the backend using `fetch()`.

## 1. Configure backend

```bash
cd backend
cp .env.example .env
```

Put your real OpenAI key in `backend/.env`:

```env
AI_KEY=your_real_key
AI_MODEL=gpt-5.4-nano
AI_URL=https://api.openai.com/v1
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Never commit `.env`.

## 2. Install dependencies

From the project root:

```bash
npm run install:all
```

Or separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Start backend

Terminal 1:

```bash
npm run backend
```

Backend:
`http://localhost:3001`

Health check:
`http://localhost:3001/api/health`

## 4. Start frontend

Terminal 2:

```bash
npm run frontend
```

Frontend:
`http://localhost:3000`

The browser calls:

```text
POST http://localhost:3001/api/chat-completions
POST http://localhost:3001/api/responses
```

## Data flow

```text
Browser
  │
  │ fetch()
  ▼
Frontend :3000
  │
  │ HTTP API
  ▼
Express Backend :3001
  │
  │ OpenAI SDK
  ▼
OpenAI API
```

## Important

Do not put `AI_KEY` in frontend JavaScript. The key belongs only in `backend/.env`.
