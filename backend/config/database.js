const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../data/app.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('✅ Users table ready');
      // Insert demo user if not exists
      insertDemoUser();
    }
  });
}

// Insert demo user
function insertDemoUser() {
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('demoSmart!@#', 10);
  
  db.get('SELECT * FROM users WHERE email = ?', ['demoe@smartclean.se'], (err, row) => {
    if (err) {
      console.error('Error checking demo user:', err.message);
    } else if (!row) {
      // Insert demo user
      db.run(`
        INSERT INTO users (name, email, password) 
        VALUES (?, ?, ?)
      `, ['demoSmartClean', 'demoe@smartclean.se', hashedPassword], (err) => {
        if (err) {
          console.error('Error inserting demo user:', err.message);
        } else {
          console.log('✅ Demo user created successfully');
        }
      });
    } else {
      console.log('✅ Demo user already exists');
    }
  });
}

// Database helper functions
const dbHelpers = {
  // Get all users
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get user by ID
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get user by email (for authentication)
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Create new user
  createUser: (name, email, password) => {
    return new Promise((resolve, reject) => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      db.run(`
        INSERT INTO users (name, email, password) 
        VALUES (?, ?, ?)
      `, [name, email, hashedPassword], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, name, email });
        }
      });
    });
  },

  // Update user
  updateUser: (id, name, email) => {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, email, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, name, email });
        }
      });
    });
  },

  // Delete user
  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedRows: this.changes });
        }
      });
    });
  }
};

module.exports = { db, dbHelpers };
