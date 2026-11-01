import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

export function initDatabase(): Database.Database | null {
  // Lấy đường dẫn an toàn trong thư mục userData của máy người dùng
  const dbPath = join(app.getPath('userData'), 'app.db')

  // Khởi tạo kết nối
  const db = new Database(dbPath, { verbose: console.log })

  // Tạo bảng mẫu
  initTable(db)
  return db
}

function initTable(db: Database.Database) {
  db.pragma('foreign_keys = ON')

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS confidentiality_levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          do_mat VARCHAR(50) NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS delivery_methods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hinh_thuc VARCHAR(50) NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  // Departments
  db.exec(
    `
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ten_don_vi VARCHAR(150) NOT NULL UNIQUE,
          viet_tat VARCHAR(20),
          email VARCHAR(150),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS partners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ten VARCHAR(200) NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS requirement (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ten VARCHAR(200) NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ho_ten VARCHAR(100) NOT NULL,
          chuc_vu VARCHAR(150),
          email VARCHAR(150) UNIQUE,
          department_id INTEGER REFERENCES departments(id),
          is_signer BOOLEAN NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS document_types (
          id                 INTEGER PRIMARY KEY AUTOINCREMENT,
          ten_loai           TEXT NOT NULL UNIQUE,         -- Công văn, Quyết định...
          viet_tat           TEXT,                         -- QĐ, TB, TTr... (công văn: NULL)
          so_di_cuoi_truoc   INTEGER NOT NULL DEFAULT 0,   -- Dùng khi đánh số theo loại
          mau_van_ban_url    TEXT,                         -- Link mẫu Google Docs
          is_active          BOOLEAN NOT NULL DEFAULT 1,    -- SQLite lưu BOOLEAN dưới dạng 0 hoặc 1
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS urgency_levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          do_khan VARCHAR(50) NOT NULL UNIQUE,
          so_ngay_xu_ly SMALLINT NOT NULL CHECK (so_ngay_xu_ly >= 0),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS incoming_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          so_den INTEGER NOT NULL,
          ngay_den DATE NOT NULL DEFAULT (CURRENT_DATE),

          partner_id INTEGER REFERENCES partners(id),
          so_ky_hieu_goc VARCHAR(100),
          ngay_van_ban DATE,
          type_id INTEGER REFERENCES document_types(id),
          trich_yeu TEXT NOT NULL,
          urgency_id INTEGER REFERENCES urgency_levels(id),
          confidentiality_id INTEGER REFERENCES confidentiality_levels(id),
          delivery_id INTEGER REFERENCES delivery_methods(id),

          requirement_id INTEGER REFERENCES requirement(id),
          y_kien TEXT,
          department_id INTEGER REFERENCES departments(id),
          people_id INTEGER REFERENCES people(id),
          han_xu_ly DATE,
          ngay_hoan_thanh DATE,
          ghi_chu TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (so_den)
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS outgoing_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          so_di INTEGER NOT NULL,
          so_ky_hieu VARCHAR(100) NOT NULL,
          ngay_ban_hanh DATE NOT NULL DEFAULT (CURRENT_DATE),
          
          type_id INTEGER NOT NULL REFERENCES document_types(id),
          trich_yeu TEXT NOT NULL,
          department_id INTEGER REFERENCES departments(id),
          nguoi_ky_id INTEGER REFERENCES people(id),
          urgency_id INTEGER REFERENCES urgency_levels(id),
          confidentiality_id INTEGER REFERENCES confidentiality_levels(id),
          link_file TEXT,
          
          noi_nhan TEXT,
          kinh_gui TEXT,
          delivery_id INTEGER REFERENCES delivery_methods(id),
          ngay_gui DATE,
          so_ban INTEGER,
          ghi_chu TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (so_ky_hieu)
        )
      `
  )

  db.exec(
    `
        CREATE TABLE IF NOT EXISTS document_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          incoming_id INTEGER NOT NULL REFERENCES incoming_documents(id) ON DELETE CASCADE,
          person_id INTEGER NOT NULL REFERENCES people(id),
          vai_tro VARCHAR(20) NOT NULL DEFAULT 'xu_ly'
            CHECK (vai_tro IN ('chu_tri', 'xu_ly', 'phoi_hop')),
          y_kien TEXT,
          assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        )
      `
  )
}
