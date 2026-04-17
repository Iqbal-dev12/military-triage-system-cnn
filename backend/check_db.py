from app.database import SessionLocal
from app.models import Patient

db = SessionLocal()
try:
    p = db.query(Patient).order_by(Patient.id.desc()).first()
    if p:
        print(f"ID: {p.patientId}")
        print(f"Status: {p.status}")
        print(f"Image Score: {p.imageScore}")
        print(f"Audio Score: {p.audioScore}")
        print(f"Survival Prob: {p.survivalProbability}")
    else:
        print("No patients found")
finally:
    db.close()
