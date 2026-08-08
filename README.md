# PeerConnect

PeerConnect is a full-stack web platform that helps students find collaborators for study groups, side projects, and coursework. Users create a profile listing their skills and interests, post what they're looking for, browse and message other students, and chat in real time — all in one place instead of scattered across WhatsApp groups and campus forums.

This was built as a hands-on full-stack project to apply the MERN stack (MongoDB, Express, React, Node.js) end to end: designing a REST API, modeling relational-style data in MongoDB, handling authentication securely, and layering real-time features on top with WebSockets.

**Live demo:** https://peer-connect-sandy.vercel.app
**Backend API:** https://peerconnect-backend-29ov.onrender.com/api/health

> Note: the backend runs on a free-tier server that sleeps after periods of inactivity. The first request after idle time may take 30–50 seconds to respond while it wakes up — this is a hosting limitation, not an app bug.

---

## Features

- **Authentication** — secure signup and login with hashed passwords (bcrypt) and JWT-based sessions
- **Profiles** — users list their course, year, bio, skills, and interests
- **Posts** — create posts tagged as a study group, project, or general request, with free-text tags for discovery
- **Feed** — browse all posts, filter by type, search by keyword
- **Comments & likes** — engage with other students' posts
- **Peer discovery** — browse all registered students and view their profiles
- **Real-time chat** — one-to-one messaging powered by Socket.io, with online/offline presence indicators
- **Persistent conversations** — full message history stored in MongoDB, so conversations survive refreshes and logins

---

## Tech stack

**Frontend**
- React 18 (Vite)
- React Router for client-side routing
- Tailwind CSS for styling
- Axios for API requests
- Socket.io-client for real-time messaging

**Backend**
- Node.js + Express
- MongoDB with Mongoose (schema modeling for Users, Posts, Comments, Messages)
- Socket.io for WebSocket-based real-time chat
- JSON Web Tokens (JWT) for stateless authentication
- bcryptjs for password hashing

**Infrastructure**
- MongoDB Atlas (managed database, free tier)
- Render (backend hosting)
- Vercel (frontend hosting)

---

## Architecture overview

```
┌─────────────┐         REST API (HTTPS)        ┌──────────────┐
│   React     │ ───────────────────────────────▶ │   Express    │
│  (Vercel)   │ ◀─────────────────────────────── │   (Render)   │
│             │                                    │              │
│             │         WebSocket (Socket.io)      │              │
│             │ ◀────────────────────────────────▶│              │
└─────────────┘                                    └──────┬───────┘
                                                            │
                                                            ▼
                                                    ┌──────────────┐
                                                    │   MongoDB    │
                                                    │   (Atlas)    │
                                                    └──────────────┘
```

- The React frontend talks to the Express backend over two channels: standard REST calls for auth, posts, and profile data, and a persistent WebSocket connection (via Socket.io) for real-time messaging.
- Every REST request (except signup/login) carries a JWT in the `Authorization` header, verified by Express middleware before reaching any route handler.
- Every Socket.io connection is authenticated the same way — the token is verified during the WebSocket handshake, so unauthenticated clients can never open a socket.
- MongoDB stores four collections: `users`, `posts`, `comments`, and `messages`, related to each other via ObjectId references (similar to foreign keys in a relational database).

---

## Project structure

```
peerconnect/
├── backend/
│   ├── models/          Mongoose schemas (User, Post, Comment, Message)
│   ├── routes/           Express route handlers (auth, users, posts, messages)
│   ├── middleware/       JWT verification middleware
│   ├── server.js          App entry point + Socket.io setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           Axios instance with auth interceptor
│   │   ├── context/       Auth and Socket React contexts
│   │   ├── components/    Shared UI (Navbar, ProtectedRoute)
│   │   ├── pages/         Route-level pages (Feed, Chat, Profile, etc.)
│   │   └── App.jsx        Route definitions
│   └── package.json
└── README.md
```

---

## Running it locally

### Prerequisites
- Node.js 18+ and npm
- A MongoDB database — either installed locally or a free MongoDB Atlas cluster

### 1. Clone the repo
```bash
git clone https://github.com/Bhavana-yadaveni/PeerConnect.git
cd PeerConnect
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env` with your own `MONGO_URI` and `JWT_SECRET`, then:
```bash
npm run dev
```
Confirm it's running by visiting `http://localhost:5000/api/health`.

### 3. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the printed URL (typically `http://localhost:5173`).

### 4. Try it out
Sign up, create a post, then open a second browser (or incognito window), sign up as a different user, and message the first account to see real-time chat in action.

---

## Environment variables

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `PORT` | Port the Express server runs on (default 5000) |
| `CLIENT_URL` | URL of the deployed/local frontend, used for CORS |

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend REST API |
| `VITE_SOCKET_URL` | Base URL of the backend, used for the Socket.io connection |

---

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get the logged-in user's profile |
| GET | `/api/users` | List all users (excluding self) |
| PUT | `/api/users/me` | Update the logged-in user's profile |
| GET | `/api/posts` | List posts (supports `type`, `tag`, `search` query params) |
| POST | `/api/posts` | Create a post |
| POST | `/api/posts/:id/like` | Toggle like on a post |
| POST | `/api/posts/:id/comments` | Add a comment |
| GET | `/api/messages` | List the logged-in user's conversations |
| GET | `/api/messages/:otherUserId` | Get full message history with one user |

Real-time events (Socket.io):
- `send-message` — client emits to send a message
- `receive-message` — server emits to deliver a new message
- `online-users` — server broadcasts the current list of online user IDs

---

## What I'd improve next

- Recommendation feature: suggest peers or posts based on shared skills/interests (cosine similarity or a simple tag-overlap score)
- Notification system for new messages/comments while offline
- Pagination on the feed for larger datasets
- Automated tests (Jest + Supertest for the API, React Testing Library for components)
- CI/CD pipeline to auto-deploy on push to `main`

---

## License

MIT
