CREATE TABLE IF NOT EXISTS chat_conversations (
  id CHAR(36) PRIMARY KEY,
  kind ENUM('direct','group','channel') NOT NULL,
  title VARCHAR(100) NULL,
  direct_key VARCHAR(50) NULL UNIQUE,
  created_by INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (created_by) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS chat_members (
  conversation_id CHAR(36) NOT NULL,
  employee_id INT NOT NULL,
  last_read_id BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id,employee_id),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id CHAR(36) NOT NULL,
  sender_id INT NOT NULL,
  client_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  content JSON NULL,
  reply_to BIGINT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY chat_retry (sender_id,client_id),
  KEY chat_history (conversation_id,id),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  FOREIGN KEY (sender_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS chat_votes (
  message_id BIGINT NOT NULL,
  employee_id INT NOT NULL,
  option_index TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (message_id,employee_id,option_index),
  FOREIGN KEY (message_id) REFERENCES chat_messages(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS chat_checks (
  message_id BIGINT NOT NULL,
  item_index TINYINT UNSIGNED NOT NULL,
  checked BOOLEAN NOT NULL,
  checked_by INT NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (message_id,item_index),
  FOREIGN KEY (message_id) REFERENCES chat_messages(id),
  FOREIGN KEY (checked_by) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS chat_presence (
  employee_id INT PRIMARY KEY,
  last_seen DATETIME(3) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
CREATE TABLE IF NOT EXISTS chat_attachments (
  id CHAR(36) PRIMARY KEY,
  conversation_id CHAR(36) NOT NULL,
  uploaded_by INT NOT NULL,
  message_id BIGINT NULL,
  name VARCHAR(200) NOT NULL,
  size INT NOT NULL,
  media_type VARCHAR(60) NULL,
  sha256 CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id),
  FOREIGN KEY (uploaded_by) REFERENCES employees(id),
  FOREIGN KEY (message_id) REFERENCES chat_messages(id),
  KEY chat_attachment_message (message_id)
);
