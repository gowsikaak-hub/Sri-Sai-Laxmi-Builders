import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import db from "./db.js";
import { requireAdmin } from "./auth.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(origin => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Set JWT_SECRET in backend/.env to a random value of at least 32 characters.");
  process.exit(1);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) return callback(null, true);
    return callback(new Error("Origin is not allowed by the API."));
  },
  credentials: true
}));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir, { dotfiles: "deny", index: false }));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000
};
const imageExtensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${imageExtensions[file.mimetype] || ".img"}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!imageExtensions[file.mimetype]) return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
    cb(null, true);
  }
});

function isValidImageSignature(buffer, mimetype) {
  if (mimetype === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return mimetype === "image/webp" && buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
}

function removeStoredImage(imageUrl) {
  if (!imageUrl?.startsWith("/uploads/")) return;
  const filename = path.basename(imageUrl);
  if (filename !== imageUrl.slice("/uploads/".length)) return;
  const filePath = path.join(uploadsDir, filename);
  if (filePath.startsWith(uploadsDir + path.sep)) fs.rmSync(filePath, { force: true });
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/public/site", (_req, res) => {
  const company = db.prepare("SELECT * FROM company WHERE id=1").get();
  const services = db.prepare("SELECT * FROM services ORDER BY id DESC").all();
  const projects = db.prepare("SELECT * FROM projects ORDER BY id DESC").all();
  res.json({ company, services, projects });
});

app.post("/api/public/enquiries", (req, res) => {
  const { name, phone, email = "", message } = req.body || {};
  if (!name?.trim() || !phone?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, phone and message are required." });
  }
  if (name.length > 100 || phone.length > 30 || email.length > 120 || message.length > 2000) {
    return res.status(400).json({ error: "Please shorten the submitted details." });
  }
  const result = db.prepare(
    "INSERT INTO enquiries (name,phone,email,message) VALUES (?,?,?,?)"
  ).run(name.trim(), phone.trim(), email.trim(), message.trim());
  res.status(201).json({ message: "Enquiry submitted successfully.", id: result.lastInsertRowid });
});

const orderStatuses = ["pending", "accepted", "rejected", "in_progress", "completed", "cancelled"];
const orderFields = ["customer_name", "phone", "email", "address", "service_type", "order_details", "quantity", "budget", "status", "admin_note"];

function validateOrder(body, partial = false) {
  const required = ["customer_name", "phone", "service_type", "order_details"];
  if (!partial && required.some(field => typeof body?.[field] !== "string" || !body[field].trim())) {
    return "Customer name, phone, service type and order details are required.";
  }
  for (const field of orderFields) {
    if (body?.[field] !== undefined && typeof body[field] !== "string") return `${field} must be text.`;
  }
  const limits = { customer_name: 100, phone: 30, email: 120, address: 300, service_type: 100, order_details: 3000, quantity: 50, budget: 50, admin_note: 2000 };
  for (const [field, limit] of Object.entries(limits)) {
    if (typeof body?.[field] === "string" && body[field].length > limit) return `${field} is too long.`;
  }
  if (body?.status !== undefined && !orderStatuses.includes(body.status)) return "Invalid order status.";
  return null;
}

app.post("/api/public/orders", (req, res) => {
  const error = validateOrder(req.body || {});
  if (error) return res.status(400).json({ error });
  const body = req.body;
  const result = db.prepare(`
    INSERT INTO orders (customer_name,phone,email,address,service_type,order_details,quantity,budget)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    body.customer_name.trim(), body.phone.trim(), (body.email || "").trim(), (body.address || "").trim(),
    body.service_type.trim(), body.order_details.trim(), (body.quantity || "").trim(), (body.budget || "").trim()
  );
  res.status(201).json({ message: "Order request submitted successfully.", id: result.lastInsertRowid });
});

app.post("/api/admin/login", loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const admin = db.prepare("SELECT * FROM admins WHERE username=?").get(username.trim());
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.cookie("admin_token", token, cookieOptions);
  res.json({ message: "Logged in.", username: admin.username });
});

app.post("/api/admin/logout", (_req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  res.json({ message: "Logged out." });
});

app.get("/api/admin/me", requireAdmin, (req, res) => res.json({ username: req.admin.username }));

app.put("/api/admin/company", requireAdmin, (req, res) => {
  const fields = ["name","short_name","phone1","phone2","email","address","additional_address","tagline"];
  const values = fields.map(k => typeof req.body?.[k] === "string" ? req.body[k].trim() : null);
  if (values.some(v => !v)) return res.status(400).json({ error: "All company fields are required." });
  db.prepare(`UPDATE company SET ${fields.map(k => `${k}=?`).join(",")} WHERE id=1`).run(...values);
  res.json({ message: "Company details updated." });
});

app.post("/api/admin/services", requireAdmin, (req, res) => {
  const { title, description } = req.body || {};
  if (!title?.trim() || !description?.trim()) return res.status(400).json({ error: "Title and description are required." });
  const result = db.prepare("INSERT INTO services(title,description) VALUES (?,?)").run(title.trim(), description.trim());
  res.status(201).json({ id: result.lastInsertRowid, title: title.trim(), description: description.trim() });
});
app.delete("/api/admin/services/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM services WHERE id=?").run(Number(req.params.id));
  res.json({ message: "Service deleted." });
});

app.post("/api/admin/projects", requireAdmin, upload.single("image"), async (req, res, next) => {
  const { title, category, description, image_url = "" } = req.body || {};
  if (!title?.trim() || !category?.trim() || !description?.trim()) {
    if (req.file) removeStoredImage(`/uploads/${req.file.filename}`);
    return res.status(400).json({ error: "Title, category and description are required." });
  }
  if (req.file) {
    try {
      const signature = await fs.promises.readFile(req.file.path);
      if (!isValidImageSignature(signature.subarray(0, 16), req.file.mimetype)) {
        removeStoredImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: "The uploaded file is not a valid supported image." });
      }
    } catch (error) {
      removeStoredImage(`/uploads/${req.file.filename}`);
      return next(error);
    }
  }
  const storedImageUrl = req.file ? `/uploads/${req.file.filename}` : image_url.trim();
  try {
    const result = db.prepare("INSERT INTO projects(title,category,description,image_url) VALUES (?,?,?,?)")
      .run(title.trim(), category.trim(), description.trim(), storedImageUrl);
    res.status(201).json({ id: result.lastInsertRowid, title: title.trim(), category: category.trim(), description: description.trim(), image_url: storedImageUrl });
  } catch (error) {
    if (req.file) removeStoredImage(storedImageUrl);
    next(error);
  }
});
app.delete("/api/admin/projects/:id", requireAdmin, (req, res) => {
  const project = db.prepare("SELECT image_url FROM projects WHERE id=?").get(Number(req.params.id));
  db.prepare("DELETE FROM projects WHERE id=?").run(Number(req.params.id));
  removeStoredImage(project?.image_url);
  res.json({ message: "Project deleted." });
});

app.get("/api/admin/enquiries", requireAdmin, (_req, res) => {
  res.json(db.prepare("SELECT * FROM enquiries ORDER BY id DESC").all());
});
app.delete("/api/admin/enquiries/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM enquiries WHERE id=?").run(Number(req.params.id));
  res.json({ message: "Enquiry deleted." });
});

app.get("/api/admin/orders", requireAdmin, (_req, res) => {
  res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
});

app.put("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const error = validateOrder(req.body || {});
  if (error) return res.status(400).json({ error });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid order id." });
  const body = req.body;
  const result = db.prepare(`
    UPDATE orders SET customer_name=?, phone=?, email=?, address=?, service_type=?,
      order_details=?, quantity=?, budget=?, status=?, admin_note=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    body.customer_name.trim(), body.phone.trim(), (body.email || "").trim(), (body.address || "").trim(),
    body.service_type.trim(), body.order_details.trim(), (body.quantity || "").trim(), (body.budget || "").trim(),
    (body.status || "pending"), (body.admin_note || "").trim(), id
  );
  if (!result.changes) return res.status(404).json({ error: "Order not found." });
  res.json({ message: "Order updated." });
});

app.delete("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const result = db.prepare("DELETE FROM orders WHERE id=?").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Order not found." });
  res.json({ message: "Order deleted." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller." : "Upload a JPEG, PNG or WebP image." });
  }
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
