# PeerConnect

A full-stack student collaboration platform: find peers, post about study groups
or side projects, comment, like posts, and chat in real time.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · MongoDB (Mongoose) · Socket.io · JWT auth

## Project structure

```
peerconnect/
  backend/     Express API + MongoDB models + Socket.io server
  frontend/    React app (Vite)
```

## Prerequisites

- Node.js 18+ and npm — check with `node -v`
- MongoDB — either:
  - installed locally (`mongod` running on your machine), or
  - a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas) — easier if you don't want to install MongoDB locally

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — any long random string (you can generate one with `openssl rand -base64 32`)

Start the backend:

```bash
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

Test it's alive: open `http://localhost:5000/api/health` in your browser — you should see `{"status":"ok", ...}`.

## 2. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`. Open it in your browser.

## 3. Using the app

1. Go to `http://localhost:5173/signup` and create an account.
2. Create a post on the Feed page ("+ New Post").
3. Open an incognito window (or a second browser) and sign up as a second user.
4. Go to "Find Peers" and click "Message" next to the first user to open a live chat — send a message from one window and watch it appear instantly in the other.

## Common issues

- **"MongoDB connection error"** — check `MONGO_URI` in `backend/.env`. If using Atlas, make sure your current IP is allowlisted (Atlas dashboard → Network Access).
- **CORS errors in the browser console** — make sure `CLIENT_URL` in `backend/.env` matches the URL your frontend is actually running on (default `http://localhost:5173`).
- **Chat messages not appearing live** — check the backend terminal for `User connected: ...` logs when you open the Chat page; if missing, the socket isn't authenticating (check your JWT_SECRET matches and you're logged in).
- **Port already in use** — change `PORT` in `backend/.env`, or stop whatever else is using port 5000/5173.

## Deploying (optional, for a live demo link on your resume)

- **Frontend:** Vercel or Netlify (build command `npm run build`, output folder `dist`)
- **Backend:** Render or Railway (set the same environment variables as `.env`)
- **Database:** MongoDB Atlas (free M0 tier is enough)

Remember to update `VITE_API_URL` / `VITE_SOCKET_URL` in the frontend and `CLIENT_URL` in the backend to point at your deployed URLs instead of localhost.
