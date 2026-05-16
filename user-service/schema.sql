-- ============================================================
--  User Service — Database Schema
--  Database: gallery_users
-- ============================================================

CREATE DATABASE IF NOT EXISTS gallery_users
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gallery_users;

-- ──────────────────────────────────────────
-- users  (основная таблица, раньше "login")
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('buyer', 'artist', 'admin') NOT NULL DEFAULT 'buyer',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────
-- profiles  (расширенные данные профиля)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  full_name   VARCHAR(200)  DEFAULT NULL,
  bio         TEXT          DEFAULT NULL,
  avatar      VARCHAR(500)  DEFAULT NULL,
  preferences JSON          DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_id (user_id),
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────
-- Начальный admin-аккаунт
-- password: admin123  (поменяй после первого входа)
-- ──────────────────────────────────────────
INSERT IGNORE INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@gallery.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- "password"
  'admin'
);

-- Профиль для admin
INSERT IGNORE INTO profiles (user_id, preferences)
SELECT id, '{}'
FROM users WHERE email = 'admin@gallery.com';
