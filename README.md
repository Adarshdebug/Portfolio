# Modern Portfolio With Admin Dashboard

Full-stack portfolio website with a React/Vite frontend, Express API, MongoDB persistence, JWT admin authentication, image uploads, editable about/contact content, and project CRUD.

## Folder Structure

```text
client/
  src/
    admin/        Admin login and dashboard
    components/   Shared UI components
    context/      Auth and theme providers
    lib/          API helpers
    pages/        Public portfolio routes
server/
  src/
    config/       MongoDB connection
    controllers/  Route handlers
    middleware/   Auth, upload, errors
    models/       Mongoose schemas
    routes/       REST API routes
  uploads/        Multer image uploads
```

## Features

- Public portfolio pages: home, about, projects, contact
- Animated hero typing effect, Framer Motion transitions, sticky navbar, responsive layout
- Dark and light mode
- Project cards with category filter and search
- Contact form with optional SMTP email sending
- Admin JWT login
- Dashboard stats for projects and views
- Project CRUD with image upload, featured flag, and visibility toggle
- Editable bio, skills, email, and social links
- Toast notifications, loading skeletons, SEO metadata, lazy-loaded images

## Setup

1. Install server dependencies:

```bash
cd server
npm install
```

2. Create the server environment file:

```bash
cp .env.example .env
```

Update `server/.env` with your MongoDB URI, JWT secret, admin email, and admin password.

3. Seed sample data:

```bash
npm run seed
```

4. Start the API:

```bash
npm run dev
```

5. Install client dependencies in a second terminal:

```bash
cd client
npm install
```

6. Create the client environment file:

```bash
cp .env.example .env
```

7. Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Default Admin

The seed script uses these defaults unless changed in `server/.env`:


```

Admin dashboard: `http://localhost:5173/admin/login`

## API Overview

```text
POST   /api/auth/login
GET    /api/auth/me
GET    /api/projects
GET    /api/projects/stats
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/about
PUT    /api/about
GET    /api/contact
PUT    /api/contact
POST   /api/contact/message
```

Protected routes require:

```text
Authorization: Bearer <token>
```

## Email Sending

The contact form works without paid services. If SMTP variables are empty, messages are logged by the server. To send real email, fill in `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`, and `CONTACT_RECEIVER` in `server/.env`.

## Production Notes

- Use a strong `JWT_SECRET`.
- Set `CLIENT_URL` to the deployed frontend origin.
- Set `VITE_API_URL` and `VITE_UPLOAD_URL` to the deployed API origin.
- Serve uploaded images from `/uploads`.
- Keep MongoDB credentials outside source control.
