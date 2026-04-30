import mysql from 'mysql2/promise'

let pool

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_scheduler',
      connectionLimit: 10,
      namedPlaceholders: true,
      waitForConnections: true,
    })
  }

  return pool
}

export function getPool() {
  return createPool()
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}

export async function initializeDatabase() {
  const database = process.env.DB_NAME || 'ai_scheduler'
  const setupConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  })

  await setupConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``)
  await setupConnection.end()

  const db = createPool()

  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      owner VARCHAR(255) NOT NULL DEFAULT 'Unassigned',
      type VARCHAR(80) NOT NULL,
      priority VARCHAR(40) NOT NULL,
      due_date DATE NOT NULL,
      due_time TIME NOT NULL DEFAULT '09:00:00',
      duration INT NOT NULL,
      focus_window VARCHAR(80) NOT NULL,
      reminder VARCHAR(120) NOT NULL,
      task_brief TEXT NOT NULL,
      dependencies TEXT,
      ai_instructions TEXT,
      auto_plan TINYINT(1) NOT NULL DEFAULT 1,
      mobile_number VARCHAR(32),
      sms_enabled TINYINT(1) NOT NULL DEFAULT 0,
      email_address VARCHAR(255),
      email_enabled TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('remaining', 'completed') NOT NULL DEFAULT 'remaining',
      schedule_summary TEXT,
      ai_source VARCHAR(80) NOT NULL DEFAULT 'gemini',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS task_parts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      sequence INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      objective TEXT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      scheduled_at DATETIME,
      duration_minutes INT NOT NULL,
      notes TEXT,
      sms_status VARCHAR(24) NOT NULL DEFAULT 'pending',
      sms_sent_at TIMESTAMP NULL,
      sms_error TEXT,
      email_status VARCHAR(24) NOT NULL DEFAULT 'pending',
      email_sent_at TIMESTAMP NULL,
      email_error TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_task_parts_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE CASCADE
    )
  `)

  await ensureColumn(db, 'tasks', 'mobile_number', 'mobile_number VARCHAR(32)')
  await ensureColumn(db, 'tasks', 'sms_enabled', 'sms_enabled TINYINT(1) NOT NULL DEFAULT 0')
  await ensureColumn(db, 'tasks', 'email_address', 'email_address VARCHAR(255)')
  await ensureColumn(
    db,
    'tasks',
    'email_enabled',
    'email_enabled TINYINT(1) NOT NULL DEFAULT 0',
  )
  await ensureColumn(db, 'task_parts', 'scheduled_at', 'scheduled_at DATETIME')
  await ensureColumn(
    db,
    'task_parts',
    'sms_status',
    "sms_status VARCHAR(24) NOT NULL DEFAULT 'pending'",
  )
  await ensureColumn(db, 'task_parts', 'sms_sent_at', 'sms_sent_at TIMESTAMP NULL')
  await ensureColumn(db, 'task_parts', 'sms_error', 'sms_error TEXT')
  await ensureColumn(
    db,
    'task_parts',
    'email_status',
    "email_status VARCHAR(24) NOT NULL DEFAULT 'pending'",
  )
  await ensureColumn(db, 'task_parts', 'email_sent_at', 'email_sent_at TIMESTAMP NULL')
  await ensureColumn(db, 'task_parts', 'email_error', 'email_error TEXT')
}

async function ensureColumn(db, tableName, columnName, definition) {
  const database = process.env.DB_NAME || 'ai_scheduler'
  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [database, tableName, columnName],
  )

  if (rows.length === 0) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`)
  }
}
