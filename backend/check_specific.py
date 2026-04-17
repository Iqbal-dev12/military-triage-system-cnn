from app.database import SessionLocal
from app.models import Patient

db = SessionLocal()
try:
    p = db.query(Patient).filter(Patient.patientId == "PAT-1776248356-368").first()
    if p:
        print(f"ID: {p.patientId}")
        print(f"Status: {p.status}")
        print(f"Image Score: {p.imageScore}")
        print(f"Audio Score: {p.audioScore}")
        print(f"Survival Prob: {p.survivalProbability}")
    else:
        print("Patient not found")
finally:
    db.close()
