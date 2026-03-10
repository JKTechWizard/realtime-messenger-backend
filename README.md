# Nexus Chat — Backend

Node.js + Express + Socket.IO backend with MongoDB + Mongoose. Strict TypeScript throughout, feature-based folder structure with a clean 4-layer architecture: **Routes → Controllers → Services → Repositories**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5 (strict) |
| Database | MongoDB + Mongoose 8 |
| Real-time | Socket.IO 4 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Logging | Winston |
| Security | helmet, cors, express-rate-limit |

---

## Architecture — 4-Layer Pattern

Every feature strictly follows this layered separation. Each layer has exactly one reason to change.

```
Route       →  Defines the HTTP endpoint, applies middleware, delegates to controller
Controller  →  Parses the request, calls service, sends the response
Service     →  Business rules only — never touches Mongoose directly
Repository  →  All database queries — the only place that imports a Mongoose model
```

### Why this matters

| If this changes... | Only this layer changes |
|---|---|
| HTTP method or URL | Route |
| Request/response shape | Controller |
| Business rule | Service |
| Database / ORM | Repository |

Swapping MongoDB for another database means only touching the repository files — services, controllers and routes are completely untouched.

---

## Folder Structure

```
src/
├── index.ts                                  # Entry: DB connect → HTTP server → Socket.IO
│
├── app/
│   └── app.ts                                # Express factory (CORS, helmet, rate limit, routes)
│
├── features/
│   ├── auth/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts            # signup, login, logout, getProfile
│   │   │   └── auth.validators.ts            # express-validator chains
│   │   ├── middleware/
│   │   │   └── authenticate.ts               # JWT Bearer token guard
│   │   ├── models/
│   │   │   └── User.model.ts                 # Mongoose schema + IUser interface
│   │   ├── repositories/
│   │   │   └── user.repository.ts            # All User DB queries
│   │   ├── routes/
│   │   │   └── auth.routes.ts                # /api/auth/*
│   │   ├── services/
│   │   │   └── auth.service.ts               # signup, login, getProfile business logic
│   │   └── types/
│   │       └── index.ts                      # SignupDto, LoginDto, AuthTokenResponse
│   │
│   ├── chatrooms/
│   │   ├── controllers/
│   │   │   └── chatrooms.controller.ts
│   │   ├── models/
│   │   │   └── Chatroom.model.ts             # participants[] embedded array
│   │   ├── repositories/
│   │   │   └── chatroom.repository.ts        # findAll, findById, addParticipant, etc.
│   │   ├── routes/
│   │   │   └── chatrooms.routes.ts           # /api/chatrooms/*
│   │   ├── services/
│   │   │   └── chatrooms.service.ts          # getAll, getById, create, join, leave
│   │   └── types/
│   │       └── index.ts
│   │
│   └── chat/
│       ├── controllers/
│       │   └── messages.controller.ts        # GET /api/chatrooms/:id/messages
│       ├── gateway/
│       │   └── socket.gateway.ts             # Socket.IO server — all real-time events
│       ├── models/
│       │   └── Message.model.ts              # attachments[], reactions[], replyTo ready
│       ├── repositories/
│       │   └── message.repository.ts         # findByRoom (paginated), findLastByRoom, create
│       ├── services/
│       │   └── messages.service.ts           # getMessages, createMessage
│       └── types/
│           └── index.ts
│
└── shared/
    ├── config/
    │   └── env.ts                            # Typed env config, fails fast on missing vars
    ├── database/
    │   ├── connection.ts                     # Mongoose connect/disconnect + event logging
    │   └── seed.ts                           # Demo users, rooms and messages
    ├── middleware/
    │   ├── errorHandler.ts                   # Global error + 404 handler (Mongoose-aware)
    │   └── validate.ts                       # express-validator runner
    ├── types/
    │   └── index.ts                          # JwtPayload, AuthenticatedRequest, SocketUser
    └── utils/
        ├── AppError.ts                       # AppError, NotFoundError, UnauthorizedError, etc.
        ├── logger.ts                         # Winston (coloured dev / JSON prod)
        └── response.ts                       # sendSuccess, sendCreated helpers
```

---

## MongoDB Schema Design

### Why MongoDB for this app

**Messages with embedded subdocuments** — attachments, reactions, and reply threads are all natural document fields. Adding a new attachment type (e.g. `audio`) requires zero migration. Existing documents just have an empty array.

**Denormalized `senderName`** — stored directly on each message document. Every message read returns sender info without a populate/join. This is idiomatic MongoDB and avoids N+1 query patterns in the message list.

**Participants as embedded array** — each chatroom stores `participants: [ObjectId]`. This is idiomatic for the expected room sizes in a chat app. A single MongoDB `$addToSet` / `$pull` atomically adds or removes a participant.

### Collections

```
users
  _id, firstName, lastName, email, password (select: false), createdAt, updatedAt

chatrooms
  _id, roomName, description, createdBy (ref: User), participants ([ref: User]),
  createdAt, updatedAt
  Index: roomName (unique, case-insensitive collation)

messages
  _id, roomId (ref: Chatroom), senderId (ref: User),
  senderName (denormalized String),
  content, attachments [], reactions [], replyTo (ref: Message | null),
  createdAt, updatedAt
  Index: (roomId, createdAt) compound — efficient paginated fetching per room
```

### Message document — future-ready shape

```json
{
  "_id": "...",
  "roomId": "...",
  "senderId": "...",
  "senderName": "Alice Smith",
  "content": "Check this out",
  "attachments": [
    {
      "type": "image",
      "url": "https://cdn.example.com/img.jpg",
      "name": "screenshot.jpg",
      "size": 204800,
      "mimeType": "image/jpeg",
      "width": 1920,
      "height": 1080
    }
  ],
  "reactions": [{ "emoji": "👍", "userId": "..." }],
  "replyTo": null,
  "createdAt": "2026-01-01T12:00:00.000Z"
}
```

Adding the attachments feature only requires updating the `IAttachment` interface, adding upload handling in the controller, and passing data through the repository. Zero schema migration.

---

## REST API Reference

All responses:
```json
{ "success": true,  "data": { ... }, "message": "optional" }
{ "success": false, "message": "error text", "errors": { "field": ["msg"] } }
```

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/signup` | ❌ | `{ firstName, lastName, email, password }` |
| POST | `/login`  | ❌ | `{ email, password }` |
| POST | `/logout` | ❌ | — |
| GET  | `/me`     | ✅ | — |

### Chatrooms — `/api/chatrooms`

| Method | Endpoint | Auth | Body / Query |
|---|---|---|---|
| GET  | `/`                 | ✅ | — |
| POST | `/`                 | ✅ | `{ roomName, description? }` |
| GET  | `/:roomId`          | ✅ | — |
| POST | `/:roomId/join`     | ✅ | — |
| POST | `/:roomId/leave`    | ✅ | — |
| GET  | `/:roomId/messages` | ✅ | `?limit=100&before=<ISO>` |

---

## Socket.IO Events

Connect with `auth: { token: '<JWT>' }`.

### Client → Server

| Event | Payload |
|---|---|
| `join_room` | `{ roomId }` |
| `leave_room` | `{ roomId }` |
| `send_message` | `{ roomId, content }` |
| `user_typing` | `{ roomId }` |
| `user_stopped_typing` | `{ roomId }` |

### Server → Client

| Event | Payload |
|---|---|
| `receive_message` | `{ messageId, senderId, senderName, roomId, content, timestamp }` |
| `user_typing` | `{ roomId, userId, userName }` |
| `user_stopped_typing` | `{ roomId, userId, userName }` |
| `error` | `{ message }` |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB 6+ (local or Atlas)

### 1. Install
```bash
cd chatroom-backend
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Set MONGODB_URI and JWT_SECRET at minimum
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/chatroom_db` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://localhost:5173` |
| `BCRYPT_ROUNDS` | Hash cost factor | `12` |

### 3. Seed demo data (optional)
```bash
npm run db:seed
```

### 4. Run
```bash
npm run dev     # Hot-reload via tsx watch
npm run build   # Compile to dist/
npm start       # Run compiled output
```

---

## Demo Credentials
```
alice@demo.com  /  Password123!
bob@demo.com    /  Password123!
```
