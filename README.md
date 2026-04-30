
<div align="center">

# 🚀 DEVentHub
### Full-Stack Event Management Platform

Discover events • Manage events • Secure payments • Download tickets

<p>
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react"/>
  <img src="https://img.shields.io/badge/Build-Vite-purple?logo=vite"/>
  <img src="https://img.shields.io/badge/Backend-Node.js-green?logo=node.js"/>
  <img src="https://img.shields.io/badge/Framework-Express-black?logo=express"/>
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb"/>
  <img src="https://img.shields.io/badge/API-Axios-5A29E4?logo=axios"/>
  <img src="https://img.shields.io/badge/Auth-JWT-orange"/>
  <img src="https://img.shields.io/badge/OAuth-Google-red?logo=google"/>
  <img src="https://img.shields.io/badge/Payments-Stripe-purple?logo=stripe"/>
</p>

</div>

---

# 🌐 Live Demo

Coming Soon

Suggested Deployment:

- **Frontend:** Vercel / Netlify  
- **Backend:** Render / Railway  
- **Database:** MongoDB Atlas  

---

# 🧭 Overview

**DEVentHub** is a modern **full-stack event management platform** that enables users to discover, register for, and attend events while allowing hosts to create and manage their own events.

The platform integrates:

- Secure authentication
- Role-based access control
- Stripe payments
- Google OAuth login
- Automatic ticket generation

Built using the **MERN stack** with a modern responsive UI.

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- React Router
- TailwindCSS
- Flowbite React
- Axios
- HTML2Canvas
- jsPDF
- React OAuth Google

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Google Auth Library
- Stripe API

---

# ✨ Core Features

## 👤 User Features

- Browse upcoming tech events
- View detailed event pages
- Register for free or paid events
- Secure Stripe checkout
- Google OAuth login
- Download event tickets as PDF
- Personal dashboard
- Track past and upcoming events

---

## 🧑‍💻 Host Features

- Create events
- Edit event details
- Manage event capacity
- View participants
- Dedicated host dashboard
- Track event lifecycle

---

# 🔑 Authentication Flow

DEVentHub supports **two login methods**.

### Email & Password

Users can register and login using standard credentials.

### Google OAuth

Users can login using their Google account.

The backend verifies the Google token using **google-auth-library**, then generates a **JWT token** for session management.

---

# 🧑‍💻 User Walkthrough

## 1️⃣ Registration / Login

Users can sign up using:

- Email and password
- Google login

Once logged in, users are redirected to the **Events page**.

---

## 2️⃣ Browsing Events

Users can:

- Explore upcoming events
- View event details
- See event poster, date, time, and location

---

## 3️⃣ Registering for an Event

If the event is **free**

User → Confirm Registration → Added to event participants

If the event is **paid**

User → Stripe Checkout → Payment → Registration confirmed

---

## 4️⃣ User Dashboard

The dashboard shows

- Upcoming registered events
- Previously attended events
- Ticket download option

---

## 5️⃣ Ticket Download

Users can download a **PDF ticket** containing

- Event name
- Date & time
- Location
- Poster
- Ticket ID
- User information

---

# 🧑‍💼 Host Walkthrough

Hosts manage events through a dedicated dashboard.

## 1️⃣ Host Registration

Hosts register with email/password and choose the **Host role**.

Google login is **restricted to users only**.

---

## 2️⃣ Host Dashboard

Hosts can view:

- Events they created
- Event status
- Event details

---

## 3️⃣ Creating an Event

Hosts can create events by providing:

- Event title
- Description
- Poster URL
- Date and time
- Location or online event
- Category
- Ticket type (free / paid)
- Price (if paid)
- Capacity

---

## 4️⃣ Managing Events

Hosts can:

- Edit events
- View participants
- Track event status

---

# 🎟 Ticket System

Users receive downloadable **PDF tickets** containing:

- Event name
- Event date & time
- Location
- Ticket ID
- User information

Tickets are generated using:

- **HTML2Canvas**
- **jsPDF**

---

# 💳 Payments

Paid events use **Stripe Checkout**

Flow:

User → Register → Stripe Checkout → Payment Success → Event Registration Confirmed

---

# 🧭 System Architecture

```
        User Browser
              │
              ▼
        React (Vite) Frontend
              │
              ▼
        Express API Server
              │
        ┌───────────────┐
        ▼               ▼
    MongoDB        Stripe API
        │
        ▼
 Ticket Generation
 (HTML2Canvas + jsPDF)
```

---

# 📂 Project Structure

```
DEVentHub/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── users/
│   ├── host/
│   ├── services/
│   └── context/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
```

---

# 🖼 Screenshots

Add screenshots such as:

- Landing Page
- Event Listing Page
- Event Details Page
- User Dashboard
- Host Dashboard
- Stripe Checkout
- Ticket Download

---

# 🚀 Future Improvements

Possible enhancements:

- Email notifications
- Event reminders
- QR code ticket verification
- Host analytics dashboard
- Real-time attendee tracking
- Admin moderation panel
- Event reviews & ratings

---

# 🧠 Learning Outcomes

This project demonstrates:

- Full-stack MERN development
- OAuth authentication
- Payment gateway integration
- RESTful API architecture
- Role-based application design

---

# 📜 License

MIT License

---

# 👨‍💻 Author

**Aaron Correya**  
Full-stack developer passionate about building scalable web applications.
