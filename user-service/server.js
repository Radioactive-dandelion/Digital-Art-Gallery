import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import path from "path";

const PORT = 8081;
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-key";

const app = express();

// ====== Middleware ======
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ====== MySQL connection pool ======
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gallery_users",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Проверка подключения при старте
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Connected to MySQL database");
    conn.release();
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
})();

// ====== Uploads (avatars) setup ======
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// Раздача статики (аватары)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ====== Helpers ======
function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function sendServerError(res, err, message = "Server error") {
  console.error(message, err);
  return res.status(500).json({ error: message });
}

// ====== Auth middleware ======
// Читает токен из Authorization header: "Bearer <token>"
const verifyUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "No token, unauthorized");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return sendError(res, 401, "Invalid or expired token");
    req.user = decoded; // { id, name, role }
    next();
  });
};

// Проверка роли admin
const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, () => {
    if (req.user.role !== "admin") {
      return sendError(res, 403, "Access denied: admins only");
    }
    next();
  });
};

// ====== ROUTES ======

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

/* ─────────────────────────────────────────
   REGISTER
   POST /register
   Body: { name, email, password, role? }
   role: "buyer" | "artist"  (admin нельзя зарегистрировать через форму)
───────────────────────────────────────── */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email and password are required");
    }

    // Запрещаем регистрацию с ролью admin через публичный endpoint
    const safeRole = role === "artist" ? "artist" : "buyer";

    // Проверяем уникальность email
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return sendError(res, 409, "User with this email already exists");
    }

    const hash = await bcrypt.hash(password.toString(), SALT_ROUNDS);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, safeRole]
    );

    const userId = result.insertId;

    // Создаём пустую строку профиля
    try {
      await pool.query(
        "INSERT INTO profiles (user_id, full_name, bio, avatar, preferences) VALUES (?, NULL, NULL, NULL, ?)",
        [userId, JSON.stringify({})]
      );
    } catch (pfErr) {
      console.error("Failed to create profile row:", pfErr.message);
      // Не фатально для регистрации
    }

    return res.status(201).json({ status: "Success", id: userId });
  } catch (err) {
    return sendServerError(res, err, "Registration failed");
  }
});

/* ─────────────────────────────────────────
   LOGIN
   POST /login
   Body: { email, password }
   Response: { status, token, role, name }
───────────────────────────────────────── */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password required");
    }

    const [rows] = await pool.query(
      "SELECT id, name, password, role FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) return sendError(res, 404, "User not found");

    const user = rows[0];
    const match = await bcrypt.compare(password.toString(), user.password);

    if (!match) return sendError(res, 401, "Incorrect password");

    // Кладём id, name, role в JWT payload
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Кладём токен в httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    });

    // Возвращаем токен и роль — фронтенд может хранить role в localStorage
    // для UI-решений (показывать/скрывать), но защищённые запросы идут через cookie
    return res.json({
      status: "Success",
      token,           // на случай если фронтенд захочет хранить
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    return sendServerError(res, err, "Login failed");
  }
});

/* ─────────────────────────────────────────
   LOGOUT
   POST /logout
───────────────────────────────────────── */
app.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.json({ status: "Success" });
});

/* ─────────────────────────────────────────
   VERIFY / проверка токена
   GET /me  → возвращает текущего пользователя
───────────────────────────────────────── */
app.get("/me", verifyUser, (req, res) => {
  return res.json({
    status: "Success",
    id: req.user.id,
    name: req.user.name,
    role: req.user.role,
  });
});

/* ─────────────────────────────────────────
   PROFILE — GET
   GET /profile
───────────────────────────────────────── */
app.get("/profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role,
              p.full_name, p.bio, p.avatar, p.preferences
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) return sendError(res, 404, "User not found");

    const row = rows[0];
    let prefs = {};
    try {
      prefs = row.preferences ? JSON.parse(row.preferences) : {};
    } catch {
      prefs = {};
    }

    return res.json({
      status: "Success",
      profile: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        full_name: row.full_name,
        bio: row.bio,
        avatar: row.avatar,
        preferences: prefs,
      },
    });
  } catch (err) {
    return sendServerError(res, err, "Failed to fetch profile");
  }
});

/* ─────────────────────────────────────────
   PROFILE — UPDATE
   PUT /profile
   Body: { name, full_name, bio }
───────────────────────────────────────── */
app.put("/profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, full_name, bio } = req.body;

    await pool.query("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
    await pool.query(
      "UPDATE profiles SET full_name = ?, bio = ? WHERE user_id = ?",
      [full_name, bio, userId]
    );

    return res.json({ status: "Success" });
  } catch (err) {
    return sendServerError(res, err, "Failed to update profile");
  }
});

/* ─────────────────────────────────────────
   PASSWORD CHANGE
   PUT /profile/password
   Body: { oldPassword, newPassword }
───────────────────────────────────────── */
app.put("/profile/password", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(res, 400, "Both password fields are required");
    }

    const [rows] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );
    if (!rows.length) return sendError(res, 404, "User not found");

    const match = await bcrypt.compare(oldPassword, rows[0].password);
    if (!match) return sendError(res, 401, "Old password is incorrect");

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      newHash,
      userId,
    ]);

    return res.json({ status: "Success" });
  } catch (err) {
    return sendServerError(res, err, "Failed to change password");
  }
});

/* ─────────────────────────────────────────
   PREFERENCES
   PUT /profile/preferences
   Body: { key: value, ... }
───────────────────────────────────────── */
app.put("/profile/preferences", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const newPrefs = req.body || {};

    const [rows] = await pool.query(
      "SELECT preferences FROM profiles WHERE user_id = ?",
      [userId]
    );
    const current =
      rows[0]?.preferences ? JSON.parse(rows[0].preferences) : {};
    const merged = { ...current, ...newPrefs };

    await pool.query(
      "UPDATE profiles SET preferences = ? WHERE user_id = ?",
      [JSON.stringify(merged), userId]
    );

    return res.json({ status: "Success", preferences: merged });
  } catch (err) {
    return sendServerError(res, err, "Failed to update preferences");
  }
});

/* ─────────────────────────────────────────
   AVATAR — UPLOAD
   POST /profile/avatar
   multipart/form-data, field: "avatar"
───────────────────────────────────────── */
app.post(
  "/profile/avatar",
  verifyUser,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) return sendError(res, 400, "No file uploaded");

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await pool.query(
        "UPDATE profiles SET avatar = ? WHERE user_id = ?",
        [avatarUrl, req.user.id]
      );

      return res.json({ status: "Success", avatar: avatarUrl });
    } catch (err) {
      return sendServerError(res, err, "Failed to upload avatar");
    }
  }
);

/* ─────────────────────────────────────────
   AVATAR — REMOVE
   POST /profile/avatar/remove
───────────────────────────────────────── */
app.post("/profile/avatar/remove", verifyUser, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT avatar FROM profiles WHERE user_id = ?",
      [req.user.id]
    );
    const avatar = rows[0]?.avatar;

    if (avatar) {
      const filePath = path.join(process.cwd(), avatar.replace(/^\//, ""));
      try {
        await fs.promises.unlink(filePath);
      } catch (fsErr) {
        console.warn("Could not delete avatar file:", fsErr.message);
      }
    }

    await pool.query(
      "UPDATE profiles SET avatar = NULL WHERE user_id = ?",
      [req.user.id]
    );

    return res.json({ status: "Success" });
  } catch (err) {
    return sendServerError(res, err, "Failed to remove avatar");
  }
});

/* ═══════════════════════════════════════════
   ADMIN ROUTES
   Все роуты ниже — только для role = "admin"
═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   GET /admin/users — список всех юзеров
───────────────────────────────────────── */
app.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC"
    );
    return res.json(rows);
  } catch (err) {
    return sendServerError(res, err, "Failed to fetch users");
  }
});

/* ─────────────────────────────────────────
   GET /admin/users/:id — один юзер
───────────────────────────────────────── */
app.get("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return sendError(res, 404, "User not found");
    return res.json(rows[0]);
  } catch (err) {
    return sendServerError(res, err, "Failed to fetch user");
  }
});

/* ─────────────────────────────────────────
   DELETE /admin/users/:id — удалить юзера
───────────────────────────────────────── */
app.delete("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);

    // Нельзя удалить самого себя
    if (targetId === req.user.id) {
      return sendError(res, 400, "Cannot delete your own account");
    }

    await pool.query("DELETE FROM profiles WHERE user_id = ?", [targetId]);
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      targetId,
    ]);

    if (result.affectedRows === 0) return sendError(res, 404, "User not found");

    return res.json({ status: "Success" });
  } catch (err) {
    return sendServerError(res, err, "Failed to delete user");
  }
});

/* ─────────────────────────────────────────
   PUT /admin/users/:id/role — сменить роль
   Body: { role: "buyer" | "artist" | "admin" }
───────────────────────────────────────── */
app.put("/admin/users/:id/role", verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["buyer", "artist", "admin"];

    if (!allowed.includes(role)) {
      return sendError(res, 400, "Invalid role");
    }

    const [result] = await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, req.params.id]
    );

    if (result.affectedRows === 0) return sendError(res, 404, "User not found");

    return res.json({ status: "Success" });
  } catch (err) {
    return sendServerError(res, err, "Failed to update role");
  }
});

/* ─────────────────────────────────────────
   INTERNAL ROUTE — для межсервисного общения
   GET /internal/users/:id
   Заголовок: X-Internal-Secret: <secret>
   Используется Product/Order service чтобы
   получить имя артиста по userId
───────────────────────────────────────── */
app.get("/internal/users/:id", (req, res) => {
  const secret = req.headers["x-internal-secret"];
  if (secret !== (process.env.INTERNAL_SECRET || "internal-secret")) {
    return sendError(res, 403, "Forbidden");
  }

  pool
    .query("SELECT id, name, email, role FROM users WHERE id = ?", [
      req.params.id,
    ])
    .then(([rows]) => {
      if (!rows.length) return sendError(res, 404, "User not found");
      return res.json(rows[0]);
    })
    .catch((err) => sendServerError(res, err, "Failed to fetch user"));
});

// ====== Start server ======
export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`User Service running on port ${PORT}`)
  );
}
