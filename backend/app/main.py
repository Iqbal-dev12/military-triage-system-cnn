import io
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.auth import router as auth_router
from app.security import get_current_user
from app.models import User
from app.text_analyzer import analyze_text
from app.vision_model import predict_visual
from app.audio_model import predict_audio
from app.vitals import vitals_override

# ============================================================
# APP INIT
# ============================================================

app = FastAPI(title="Military Triage Backend")

app.include_router(auth_router, prefix="/auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# CONSTANTS
# ============================================================

CLASSES = ["Green", "Yellow", "Red", "Black"]

TRIAGE_ACTIONS = {
    "Green": [
        "Minor injury",
        "Basic first aid",
        "No evacuation required"
    ],
    "Yellow": [
        "Moderate injury",
        "Clean wound",
        "Apply sterile dressing",
        "Monitor condition",
        "Provide pain relief if available"
    ],
    "Red": [
        "Severe injury",
        "Immediate medical attention",
        "Control bleeding",
        "Urgent evacuation"
    ],
    "Black": [
        "Non-survivable injury",
        "No medical intervention",
        "Prioritize other casualties"
    ]
}

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def to_prob_dict(raw: Optional[dict]):
    """
    Convert model output into full probability dictionary.
    Accepts:
        {"label": "Red", "confidence": 0.82}
    OR
        {"probabilities": {...}}
    """

    probs = {c: 0.0 for c in CLASSES}

    if not raw:
        return probs

    if "probabilities" in raw:
        return raw["probabilities"]

    if "label" in raw and "confidence" in raw:
        label = raw["label"]
        conf = raw["confidence"]

        if label in probs:
            probs[label] = conf

    return probs


def weighted_fusion(image_probs, audio_probs, text_probs):
    """
    Adaptive weighted fusion.
    Works for 1, 2, or 3 modalities.
    """

    weights = {
        "image": 0.4,
        "audio": 0.3,
        "text": 0.3
    }

    final = {c: 0.0 for c in CLASSES}
    total_weight = 0

    if image_probs:
        total_weight += weights["image"]
        for c in CLASSES:
            final[c] += image_probs[c] * weights["image"]

    if audio_probs:
        total_weight += weights["audio"]
        for c in CLASSES:
            final[c] += audio_probs[c] * weights["audio"]

    if text_probs:
        total_weight += weights["text"]
        for c in CLASSES:
            final[c] += text_probs[c] * weights["text"]

    if total_weight == 0:
        return final

    # Normalize if fewer modalities used
    for c in CLASSES:
        final[c] = final[c] / total_weight

    return final


# ============================================================
# PREDICT ROUTE
# ============================================================

@app.post("/predict")
async def predict(
    image: UploadFile = File(None),
    audio: UploadFile = File(None),
    text: str = Form(None),
    pulse: int | None = Form(None),
    spo2: int | None = Form(None),
    systolic_bp: int | None = Form(None),
    unconscious: bool = Form(False),
    current_user: User = Depends(get_current_user),
):

    if not image and not audio and not text:
        raise HTTPException(400, "Provide at least one modality")

    modalities_used = []

    # ---------------- IMAGE ----------------
    visual_raw = None
    if image:
        img_bytes = await image.read()
        visual_raw = predict_visual(img_bytes)
        modalities_used.append("image")

    # ---------------- AUDIO ----------------
    audio_raw = None
    if audio:
        audio_bytes = await audio.read()
        audio_raw = predict_audio(audio_bytes)
        modalities_used.append("audio")

    # ---------------- TEXT ----------------
    text_raw = None
    if text:
        label, conf = analyze_text(text)
        text_raw = {"label": label, "confidence": conf}
        modalities_used.append("text")

    # ---------------- CONVERT TO PROBS ----------------
    image_probs = to_prob_dict(visual_raw)
    audio_probs = to_prob_dict(audio_raw)
    text_probs = to_prob_dict(text_raw)

    # ---------------- MODEL FUSION ----------------
    model_probabilities = weighted_fusion(
        image_probs if visual_raw else None,
        audio_probs if audio_raw else None,
        text_probs if text_raw else None,
    )

    # Determine model label
    model_label = max(model_probabilities, key=model_probabilities.get)
    model_conf = model_probabilities[model_label]

    # ---------------- VITALS OVERRIDE ----------------
    final_label, final_conf, override_reason = vitals_override(
        model_probabilities.copy(),
        pulse=pulse,
        spo2=spo2,
        systolic_bp=systolic_bp,
        unconscious=unconscious
    )

    # If override happened → boost confidence
    if override_reason:
        final_conf = 0.99

    return {
        "triage_level": final_label,
        "confidence": round(final_conf * 100, 1),
        "override_reason": override_reason,
        "probabilities": model_probabilities,
        "recommended_action": TRIAGE_ACTIONS[final_label],
        "modalities_used": modalities_used,
        "visual_raw": visual_raw,
        "audio_raw": audio_raw,
        "text_raw": text_raw,
        "vitals": {
            "pulse": pulse,
            "spo2": spo2,
            "systolic_bp": systolic_bp,
            "unconscious": unconscious
        }
    }


# ============================================================
# PDF DOWNLOAD
# ============================================================

@app.post("/download-report")
def download_report(data: dict):

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    x = 40
    y = 800
    line = 18

    def draw(text):
        nonlocal y
        c.drawString(x, y, text)
        y -= line

    c.setFont("Helvetica-Bold", 16)
    draw("Military Triage Report")
    y -= 10

    c.setFont("Helvetica", 12)
    draw(f"Triage Level: {data.get('triage_level', '-')}")
    draw(f"Overall Confidence: {data.get('confidence', 0)}%")
    y -= 10

    draw("Modalities Used:")
    for m in data.get("modalities_used", []):
        draw(f"- {m}")
    y -= 10

    probs = data.get("probabilities", {})
    draw("Model Probabilities:")
    for k, v in probs.items():
        draw(f"- {k}: {round(v * 100, 1)}%")
    y -= 10

    advice = data.get("recommended_action", [])
    draw("Recommended Actions:")
    for a in advice:
        draw(f"- {a}")

    c.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=triage_report.pdf"}
    )
