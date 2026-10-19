<div align="center">

# 🚀 BRIXO 2.0

### Build. Customize. Preview. Publish. Download.

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/DikshaGangolia/BRIXO-2.0)
[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Visit-brightgreen?style=for-the-badge)](https://brixo-builder.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-6B46C1?style=for-the-badge)](https://brixo-2-0.onrender.com/)

</div>

---

## Overview

BRIXO 2.0 brings website creation and publishing workflows together in one application. Users can work with website projects in a visual builder, preview their changes, publish sites, and configure commerce-related flows for published websites.

The repository contains a React/Vite frontend and a Node.js/Express backend. The backend uses MongoDB through Mongoose and provides API routes for authentication, projects, payments, orders, verification, email, and developer tools.

## Features

- **Visual website builder** — create and customize website projects through the builder interface.
- **Dashboard and project management** — create, save, update, duplicate, and delete projects.
- **Preview and publishing** — preview project output and publish websites with public project access.
- **Authentication** — registration and login backed by the API, with JWT-based request handling.
- **Plans and payments** — subscription-related endpoints and Razorpay order/payment verification flows.
- **Shopping cart and orders** — published-site cart checkout support, online payment and cash-on-delivery order flows, and order status management.
- **Customer verification and notifications** — API routes for verification, email, and Twilio SMS integrations when configured.
- **QR publishing support** — publishing workflows include QR-code generation.
- **Project export** — frontend utilities generate downloadable website project archives.
- **Owner developer tools** — developer endpoints are included for authorized project-related operations.

> Feature availability in a running deployment depends on the deployment configuration and valid service credentials. Third-party payment, email, and SMS actions require the corresponding provider setup.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| UI and state | Tailwind CSS, Framer Motion, Zustand, Lucide React |
| HTTP and routing | Axios, React Router |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Payments | Razorpay |
| Messaging and email | Twilio, Nodemailer, Resend |
| Export | JSZip |
| Deployment | Vercel (frontend), Render (backend) |

## Repository Structure

```text
BRIXO-2.0/
├── BRIXO-2.0-main/       # React + TypeScript + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/              # Express API and database models
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── PROJECT_REPORT.md     # Development notes and feature report
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB connection for persistent database storage (recommended for deployments)
- Provider credentials for any optional payment, SMS, or email features you want to use

### 1. Clone the repository

```bash
git clone https://github.com/DikshaGangolia/BRIXO-2.0.git
cd BRIXO-2.0
```

### 2. Install frontend dependencies

```bash
cd BRIXO-2.0-main
npm install
```

### 3. Install backend dependencies

Open a second terminal at the repository root, then run:

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a local `.env` file in the `backend/` directory. Set the values appropriate for your environment. Common configuration keys used by the backend include:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend listening port; defaults to `5000` |
| `MONGO_URI` | MongoDB connection URI |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token |
| `TWILIO_PHONE_NUMBER` | Twilio sender number for SMS |

Email delivery and other integrations may require additional configuration in the relevant backend utilities. Use your provider's current dashboard to obtain credentials.

For a separately hosted frontend, set the frontend build environment variable `VITE_API_URL` to the base URL of your backend API. In production, the frontend currently falls back to `https://brixo-2-0.onrender.com` if `VITE_API_URL` is not set.

**Security:** Never commit real `.env` files, access tokens, API secrets, database credentials, or private keys to GitHub. Keep local configuration out of public archives and use your hosting provider's environment-variable settings for deployments.

### 5. Start the application

Run the backend in one terminal:

```bash
cd backend
npm start
```

Run the frontend in another terminal:

```bash
cd BRIXO-2.0-main
npm run dev
```

Vite prints the local frontend URL in the terminal (the configured development port is `5173`). The backend defaults to port `5000`.

### 6. Create a production frontend build

From `BRIXO-2.0-main/`:

```bash
npm run build
```

Vite writes the production build to the frontend's `dist/` directory.

## Deployment

- **Frontend:** [brixo-builder.vercel.app](https://brixo-builder.vercel.app/)
- **Backend health endpoint:** [brixo-2-0.onrender.com](https://brixo-2-0.onrender.com/)

The backend needs its environment variables configured in the hosting dashboard. Ensure the frontend's `VITE_API_URL` points to the intended backend, and configure the backend's CORS allowlist for the frontend origin before deploying to a new domain.

## Troubleshooting Notes

- **Network or CORS errors:** verify the backend is running, `VITE_API_URL` is correct, and the frontend origin is allowed by backend CORS.
- **Database errors:** verify `MONGO_URI` and the database provider's network access rules.
- **Payment errors:** check that the Razorpay key ID and secret are valid and belong to the intended environment.
- **SMS/email not delivered:** confirm the corresponding provider credentials, sender configuration, and account permissions.

## Contributing

Bug reports, suggestions, and pull requests are welcome. For focused changes, describe the issue and test the relevant frontend or backend workflow before submitting.

## Author

**DikshaGangolia**  
[GitHub Profile](https://github.com/DikshaGangolia)

---

If you find BRIXO 2.0 useful, consider starring the repository.
