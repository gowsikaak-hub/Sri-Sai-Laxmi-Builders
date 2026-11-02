import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const db = new Database("data.sqlite");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS company (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  phone1 TEXT NOT NULL,
  phone2 TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  additional_address TEXT NOT NULL,
  tagline TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL,
  order_details TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','in_progress','completed','cancelled')),
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const company = db.prepare("SELECT id FROM company WHERE id = 1").get();
if (!company) {
  db.prepare(`INSERT INTO company
    (id,name,short_name,phone1,phone2,email,address,additional_address,tagline)
    VALUES (1,?,?,?,?,?,?,?,?)`).run(
      "Sri Sai Laxmi Builders",
      "SSL",
      "95000 23111",
      "95433 06600",
      "srisailaxmi101@gmail.com",
      'Old No.35, New No.46, "Anbhakam", First Floor, Kamarajar Street, B.V. Nagar, Chennai - 600 114.',
      "Meenambakkam Moovarasampet Main Road, Opp. Kendriya Vidhyalaya.",
      "Building your dreams."
    );
}

if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
  const existing = db.prepare("SELECT id FROM admins WHERE username = ?").get(process.env.ADMIN_USERNAME);
  if (!existing) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
    db.prepare("INSERT INTO admins (username,password_hash) VALUES (?,?)")
      .run(process.env.ADMIN_USERNAME, hash);
    console.log("Initial admin account created from environment settings.");
  } else {
    console.log("Admin account already exists. Change password using a future password-management feature.");
  }
} else {
  console.warn("ADMIN_USERNAME / ADMIN_PASSWORD not set. Admin login will not be available.");
}

export default db;
