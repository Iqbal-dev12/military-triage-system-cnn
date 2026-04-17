import os
import sys

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models
from app.vitals import calculate_dynamic_survival

def fix_survival():
    db = SessionLocal()
    try:
        patients = db.query(models.Patient).all()
        print(f"Updating survival logic for {len(patients)} patients using dynamic vitals...")
        
        for p in patients:
            old_val = p.survivalProbability
            status = p.status.upper()
            
            # Map stored vitals to the format expected by calculate_dynamic_survival
            vitals_payload = {
                "pulse": p.heartRate,
                "spo2": p.spo2,
                "bp_systolic": 120, # Default as not stored
                "resp_rate": 16      # Default as not stored
            }
            
            new_val = calculate_dynamic_survival(vitals_payload, status)
            p.survivalProbability = new_val
            print(f"ID: {p.patientId}, Status: {status}, Old: {old_val}%, New: {new_val}% (Vitals: HR {p.heartRate}, SpO2 {p.spo2})")
            
        db.commit()
        print("Update complete.")
    except Exception as e:
        print(f"Error updating DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_survival()
