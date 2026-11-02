# Sri Sai Laxmi Builders — Full-stack website

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite (`backend/data.sqlite`)
- Admin login: bcrypt password hash + JWT in an HttpOnly cookie

## 1. Requirements
Install Node.js 20+ and npm.

## 2. Configure the backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set your own `ADMIN_USERNAME` and a strong `ADMIN_PASSWORD` (at least 12 characters). Keep `.env private; never upload it to GitHub.

## 3. Install and run
Open two terminals.

Terminal 1:
```bash
cd backend
npm install
npm run dev
```

Terminal 2:
```bash
cd frontend
npm install
npm run dev
```
Open the frontend URL shown by Vite (normally http://localhost:5173).
Admin page: http://localhost:5173/admin

### Deploying the frontend to Vercel

Create a Vercel project from this repository and set its **Root Directory** to
`frontend`. Vercel will use the included Vite configuration and `vercel.json`.
Set `VITE_API_URL` to the deployed backend API origin ending in `/api` (for
example, `https://api.example.com/api`) before deploying.

## 4. Included features
- Public website loads company profile, services and projects from the backend database.
- Contact form saves enquiries to SQLite.
- Customers can submit order requests with their contact details, project location, requirements, quantity and budget; these are saved permanently in SQLite.
- `/admin` asks for username/password.
- Admin can add/delete services and projects, view/delete enquiries, and edit, accept, reject, update, or delete customer orders.
- Admins can upload JPEG, PNG, or WebP project photos up to 5 MB; uploaded files are stored in the backend `uploads` directory and their safe paths are saved with the project.
- Company details are seeded from the supplied visiting card.

### Customer orders
Customers submit order requests from the public site's **Place an order request** section. Orders use these statuses:
`pending`, `accepted`, `rejected`, `in_progress`, `completed`, and `cancelled`.

Authenticated administrators manage orders at `/admin`. The order table is created automatically on startup, including when upgrading an existing `data.sqlite` database.

## 5. Verified company details from the card
- Sri Sai Laxmi Builders (SSL)
- Mobile: 95000 23111, 95433 06600
- Address: Old No.35, New No.46, "Anbhakam", First Floor, Kamarajar Street, B.V. Nagar, Chennai - 600 114.
- Additional address printed on card: Meenambakkam Moovarasampet Main Road, Opp. Kendriya Vidhyalaya.
- Email: srisailaxmi101@gmail.com

The visiting card does not specify services, project photos, rates, business hours, or a website URL. Those are not invented; add confirmed information through the admin dashboard.

## 6. Production notes
Before public deployment:
- Use HTTPS and set `NODE_ENV=production` and a strong random `JWT_SECRET`.
- Set `FRONTEND_URL` to the deployed frontend origin.
- Use persistent storage for SQLite (or migrate to managed PostgreSQL) because ephemeral hosting filesystems can erase the database.
- Back up the database regularly.
- Add CSRF protection / origin validation and review rate limits before launch.
- Never use the example credentials in production.
