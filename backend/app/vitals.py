import csv
import random
from pathlib import Path

CSV_PATH = Path(__file__).parent / "vitals_samples.csv"

TRIAGE_LABELS = ["Green", "Yellow", "Red", "Black"]

def load_random_vitals():
    with open(CSV_PATH, newline="") as f:
        rows = list(csv.DictReader(f))
    return random.choice(rows)


def vitals_override(probabilities, pulse=None, spo2=None, systolic_bp=None, unconscious=False):
    """
    Override triage if vitals indicate critical condition
    """
    print("🔥 VITALS OVERRIDE CALLED")
    print("Vitals:", pulse, spo2, systolic_bp, unconscious)
    print("Probabilities BEFORE:", probabilities)
    reason = None

    if unconscious or (spo2 is not None and spo2 < 70) or (systolic_bp is not None and systolic_bp < 70):
        return "Black", 0.99, "Critical vitals detected"

    if (pulse is not None and pulse > 130) or (spo2 is not None and spo2 < 85):
        return "Red", max(probabilities.get("Red", 0.6), 0.7), "Severe vital signs"

    # no override → use fused result
    final_label = max(probabilities, key=probabilities.get)
    return final_label, probabilities[final_label], None


def vitals_to_scores(v):
    """
    Convert vitals into triage probabilities
    """
    pulse = int(v["pulse"])
    spo2 = int(v["spo2"])
    bp = int(v["bp_systolic"])
    resp = int(v["resp_rate"])
    conscious = v["consciousness"]

    scores = {k: 0.0 for k in TRIAGE_LABELS}

    # ---- BLACK ----
    if spo2 < 70 or bp < 70 or conscious == "unconscious":
        scores["Black"] += 0.6

    # ---- RED ----
    if pulse > 120 or spo2 < 85 or resp > 30:
        scores["Red"] += 0.5

    # ---- YELLOW ----
    if 90 <= pulse <= 120 or 85 <= spo2 <= 92:
        scores["Yellow"] += 0.4

    # ---- GREEN ----
    if pulse < 100 and spo2 > 95 and conscious == "alert":
        scores["Green"] += 0.6

    # normalize
    total = sum(scores.values()) or 1.0
    for k in scores:
        scores[k] /= total

    return scores
