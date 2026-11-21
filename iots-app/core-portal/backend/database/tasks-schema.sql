CREATE TABLE IF NOT EXISTS work_tasks (
  id VARCHAR(40) PRIMARY KEY,
  owner_id INT NULL,
  reviewer_id INT NULL,
  created_by INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  revision INT NOT NULL,
  due_at DATETIME(3) NULL,
  payload JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX task_owner_state (owner_id,status),
  INDEX task_reviewer_state (reviewer_id,status),
  INDEX task_due (due_at),
  FOREIGN KEY (owner_id) REFERENCES employees(id),
  FOREIGN KEY (reviewer_id) REFERENCES employees(id),
  FOREIGN KEY (created_by) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS work_commands (
  actor_id INT NOT NULL,
  command_key VARCHAR(80) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  response JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (actor_id,command_key),
  FOREIGN KEY (actor_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS work_task_events (
  id CHAR(36) PRIMARY KEY,
  task_id VARCHAR(40) NOT NULL,
  actor_id INT NOT NULL,
  command_key VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX task_event_history (task_id,created_at),
  FOREIGN KEY (task_id) REFERENCES work_tasks(id),
  FOREIGN KEY (actor_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS work_files (
  id CHAR(36) PRIMARY KEY,
  task_id VARCHAR(40) NULL,
  uploaded_by INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  media_type VARCHAR(100) NOT NULL,
  bytes INT NOT NULL,
  sha256 CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX task_files (task_id),
  FOREIGN KEY (task_id) REFERENCES work_tasks(id),
  FOREIGN KEY (uploaded_by) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS work_daily_reports (
  id CHAR(36) PRIMARY KEY,
  employee_id INT NOT NULL,
  work_date DATE NOT NULL,
  revision INT NOT NULL,
  state VARCHAR(20) NOT NULL,
  payload JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY employee_report_date (employee_id,work_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
