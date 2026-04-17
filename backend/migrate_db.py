import sqlite3
import os

db_path = os.path.join('c:\\military_triage_system_CNN\\backend', 'triage.db')
print(f"Connecting to {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE patients ADD COLUMN user_id INTEGER REFERENCES users(id)")
    conn.commit()
    print("Column user_id added successfully")
except Exception as e:
    print(f"Error (possibly already exists): {e}")
finally:
    conn.close()
