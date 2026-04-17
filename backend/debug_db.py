import os
import sys

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models

def check_db():
    db = SessionLocal()
    try:
        patients = db.query(models.Patient).all()
        print(f"Total patients in DB: {len(patients)}")
        for p in patients:
            print(f"ID: {p.patientId}, Status: {p.status}, Survival: {p.survivalProbability}%, Lat: {p.latitude}, Lon: {p.longitude}")
    except Exception as e:
        print(f"Error querying DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
