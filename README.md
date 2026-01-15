# EventHive API

Backend REST API for managing events, users, comments, favorites, and event attendance.

This API is built with **Node.js**, **Express**, **MongoDB**, and **JWT authentication**.  
It supports public and private events, user permissions, favorites, and event participation.

---

## 🚀 Features

- User authentication with JWT
- Public and private events
- Event ownership permissions
- Event attendance (join events)
- Favorite events per user
- Comments on events
- Protected routes
- MongoDB with Mongoose
- Clean REST API structure

---

## 🧱 Models

### User
- email
- password
- name
- favorites (array of Events)

### Event
- title
- description
- date
- location
- isPublic
- createdBy (User)
- attendees (Users)

### Comment
- text
- event
- author

---

## 🔐 Authentication

Authentication is handled using **JSON Web Tokens (JWT)**.

Authorization: Bearer <JWT_TOKEN>

Protected routes require the following header:


---

##  API Routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

---

### Events
- `GET /api/events` → List public events
- `GET /api/events/:eventId` → Event detail (private events visible only to creator)
- `POST /api/events` → Create event (auth required)
- `PUT /api/events/:eventId` → Edit event (owner only)
- `DELETE /api/events/:eventId` → Delete event (owner only)
- `POST /api/events/:eventId/join` → Join event (auth required)

---

### Comments
- `POST /api/comments` → Create comment (auth required)
- `GET /api/comments/event/:eventId` → List comments for an event
- `DELETE /api/comments/:commentId` → Delete comment (author only)

---

### Favorites
- `GET /api/users/me/favorites` → List user favorites
- `POST /api/users/me/favorites/:eventId` → Add favorite
- `DELETE /api/users/me/favorites/:eventId` → Remove favorite

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=5005
ORIGIN=http://localhost:5173
TOKEN_SECRET=your_secret_here


## ▶️ Running the project

```bash
npm install
npm run dev

Server runs on
http://localhost:5005

🧪 Testing
All endpoints can be tested using Postman.
JWT tokens and event IDs can be stored as Postman environment variables to simplify testing.