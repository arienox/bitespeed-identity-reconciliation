import sqlite3 from 'sqlite3';

export interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:'); // Using in-memory database for simplicity
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phoneNumber TEXT,
            email TEXT,
            linkedId INTEGER,
            linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')) NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            deletedAt DATETIME
          )
        `);

        // Create indexes for better performance
        this.db.run('CREATE INDEX IF NOT EXISTS idx_phone ON contacts(phoneNumber)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_email ON contacts(email)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_linked_id ON contacts(linkedId)', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, deletedAt) VALUES (?, ?, ?, ?, ?)',
        [contact.phoneNumber, contact.email, contact.linkedId, contact.linkPrecedence, contact.deletedAt],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async findContactsByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM contacts WHERE deletedAt IS NULL';
      const params: any[] = [];

      if (email && phoneNumber) {
        query += ' AND (email = ? OR phoneNumber = ?)';
        params.push(email, phoneNumber);
      } else if (email) {
        query += ' AND email = ?';
        params.push(email);
      } else if (phoneNumber) {
        query += ' AND phoneNumber = ?';
        params.push(phoneNumber);
      }

      query += ' ORDER BY createdAt ASC';
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Contact[]);
        }
      });
    });
  }

  async findContactsByLinkedId(linkedId: number): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM contacts WHERE linkedId = ? AND deletedAt IS NULL ORDER BY createdAt ASC',
        [linkedId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Contact[]);
          }
        }
      );
    });
  }

  async findPrimaryContact(primaryId: number): Promise<Contact | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM contacts WHERE id = ? AND linkPrecedence = "primary" AND deletedAt IS NULL',
        [primaryId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Contact | null);
          }
        }
      );
    });
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.values(updates).filter((_, index) => 
        Object.keys(updates)[index] !== 'id'
      );
      
      values.push(id);
      
      this.db.run(`UPDATE contacts SET ${fields} WHERE id = ?`, values, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getAllLinkedContacts(primaryId: number): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM contacts 
         WHERE (id = ? OR linkedId = ?) AND deletedAt IS NULL 
         ORDER BY createdAt ASC`,
        [primaryId, primaryId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Contact[]);
          }
        }
      );
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
