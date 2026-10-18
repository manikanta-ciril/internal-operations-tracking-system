CREATE DATABASE IF NOT EXISTS iots_auth_temp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iots_auth_temp;
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(200) NOT NULL
);
CREATE TABLE IF NOT EXISTS roles (
  code VARCHAR(60) PRIMARY KEY,
  label VARCHAR(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS employee_roles (
  employee_id INT NOT NULL,
  role_code VARCHAR(60) NOT NULL,
  PRIMARY KEY (employee_id, role_code),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (role_code) REFERENCES roles(code)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  employee_id INT NOT NULL,
  active_role VARCHAR(60) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (active_role) REFERENCES roles(code)
);
CREATE TABLE IF NOT EXISTS session_locations (
  token_hash CHAR(64) PRIMARY KEY,
  stage VARCHAR(30) NOT NULL DEFAULT 'pending',
  location_json JSON NULL,
  confirmed_at DATETIME NULL,
  FOREIGN KEY (token_hash) REFERENCES sessions(token_hash) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS login_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NULL,
  event VARCHAR(50) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS photo_evidence (
  id CHAR(36) PRIMARY KEY,
  employee_id INT NOT NULL,
  session_hash CHAR(64) NOT NULL UNIQUE,
  storage_path VARCHAR(300) NOT NULL,
  file_size INT NOT NULL,
  sha256 CHAR(64) NOT NULL,
  captured_at DATETIME NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS photo_evidence_details (
  photo_id CHAR(36) PRIMARY KEY,
  details JSON NOT NULL,
  FOREIGN KEY (photo_id) REFERENCES photo_evidence(id) ON DELETE CASCADE
);
