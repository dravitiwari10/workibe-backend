# Workibe Backend

Backend API for **Workibe** — a professional networking and real-world meetup platform built with Node.js, Express.js, MongoDB Atlas, and Firebase.

## 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Firebase Admin SDK
- JWT Authentication
- Nodemailer (Email OTP)
- Firebase Cloud Messaging
- Firebase Firestore (Chat)

---

## 📂 Project Structure

```
workibe-backend
│
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── validations
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 📦 Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate into the project

```bash
cd workibe-backend
```

Install dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

EMAIL=

EMAIL_PASSWORD=

FIREBASE_PROJECT_ID=

FIREBASE_CLIENT_EMAIL=

FIREBASE_PRIVATE_KEY=
```

---

## ▶️ Running the Project

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## 🌐 API Base URL

```
http://localhost:5000/api
```

---

## 📌 Features

- Email OTP Authentication
- JWT Authentication
- User Profile
- Nearby User Discovery
- Activity Management
- Connection Requests
- Firebase Chat
- Push Notifications
- Block & Report Users

---

## 📁 Modules

### Authentication

- Send OTP
- Verify OTP
- Refresh Token
- Logout

### User

- Get Profile
- Update Profile
- Delete Account

### Discovery

- Nearby Professionals
- Profession Filter
- City Filter
- Interest Filter

### Activities

- Create Activity
- Update Activity
- Join Activity
- Cancel Activity

### Connections

- Send Request
- Accept Request
- Reject Request
- Remove Connection

### Notifications

- List Notifications
- Mark as Read

### Reports

- Report User
- Report Activity
- Report Message

---

## 🔒 Authentication

Protected APIs require:

```
Authorization: Bearer <access_token>
```

---

## 📋 Scripts

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## 🛠 Database

MongoDB Atlas

Collections

- users
- otp
- activities
- activityParticipants
- connections
- notifications
- reports

Firebase Firestore

- threads
- messages

---

## 👨‍💻 Development Workflow

1. Clone repository
2. Install dependencies
3. Configure `.env`
4. Start server
5. Test APIs using Postman or Thunder Client

---

## 📄 License

ISC
