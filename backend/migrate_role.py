import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "triage.db")
    print(f"Connecting to database at: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if role column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "role" not in columns:
            print("Adding 'role' column to 'users' table...")
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'")
            conn.commit()
            print("Migration successful: 'role' column added.")
        else:
            print("Column 'role' already exists in 'users' table.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
