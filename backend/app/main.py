import io
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

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
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from datetime import datetime

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=6,
        alignment=1,  # center
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#666666'),
        spaceAfter=20,
        alignment=1,
        fontName='Helvetica'
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#ffffff'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )

    # Header Section
    story.append(Paragraph("🪖 MILITARY TRIAGE REPORT", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
    story.append(Spacer(1, 0.3*inch))

    # Triage Level Banner
    triage_level = data.get('triage_level', 'Unknown')
    confidence = data.get('confidence', 0)
    
    triage_colors = {
        'Green': colors.HexColor('#10b981'),
        'Yellow': colors.HexColor('#f59e0b'),
        'Red': colors.HexColor('#ef4444'),
        'Black': colors.HexColor('#6b7280')
    }
    
    triage_color = triage_colors.get(triage_level, colors.HexColor('#6b7280'))
    
    # Triage banner table
    triage_data = [
        [Paragraph(f"<b>TRIAGE LEVEL</b>", ParagraphStyle('banner', parent=styles['Normal'], fontSize=12, textColor=colors.whitesmoke, fontName='Helvetica-Bold')),
         Paragraph(f"<b>CONFIDENCE</b>", ParagraphStyle('banner', parent=styles['Normal'], fontSize=12, textColor=colors.whitesmoke, fontName='Helvetica-Bold'))],
        [Paragraph(f"<b>{triage_level}</b>", ParagraphStyle('banner', parent=styles['Normal'], fontSize=24, textColor=colors.whitesmoke, fontName='Helvetica-Bold')),
         Paragraph(f"<b>{confidence}%</b>", ParagraphStyle('banner', parent=styles['Normal'], fontSize=24, textColor=colors.whitesmoke, fontName='Helvetica-Bold'))]
    ]
    
    triage_table = Table(triage_data, colWidths=[3*inch, 2.5*inch])
    triage_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), triage_color),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 1), (-1, 1), 20),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [triage_color, triage_color]),
    ]))
    
    story.append(triage_table)
    story.append(Spacer(1, 0.3*inch))

    # Override Reason
    if data.get('override_reason'):
        story.append(Paragraph("⚠️ OVERRIDE REASON", heading_style))
        override_style = ParagraphStyle(
            'override',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#dc2626'),
            spaceAfter=12,
            fontName='Helvetica'
        )
        story.append(Paragraph(data.get('override_reason'), override_style))
        story.append(Spacer(1, 0.2*inch))

    # Modalities Used
    story.append(Paragraph("📊 MODALITIES USED", heading_style))
    modalities_style = ParagraphStyle(
        'modalities',
        parent=styles['Normal'],
        fontSize=11,
        leftIndent=20,
        spaceAfter=8,
        fontName='Helvetica'
    )
    modalities = data.get("modalities_used", [])
    for m in modalities:
        story.append(Paragraph(f"• {m.capitalize()}", modalities_style))
    story.append(Spacer(1, 0.2*inch))

    # Model Probabilities
    story.append(Paragraph("📈 MODEL CONFIDENCE BY TRIAGE LEVEL", heading_style))
    probs = data.get("probabilities", {})
    
    prob_data = [["Triage Level", "Confidence Score", "Percentage"]]
    for k, v in probs.items():
        prob_data.append([k, f"{round(v * 100, 1)}%", "█" * int(v * 20)])
    
    prob_table = Table(prob_data, colWidths=[1.8*inch, 1.5*inch, 2*inch])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f3f4f6'), colors.HexColor('#e5e7eb')]),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(prob_table)
    story.append(Spacer(1, 0.3*inch))

    # Recommended Actions
    advice = data.get("recommended_action", [])
    if advice:
        story.append(Paragraph("💡 RECOMMENDED ACTIONS", heading_style))
        action_style = ParagraphStyle(
            'actions',
            parent=styles['Normal'],
            fontSize=11,
            leftIndent=20,
            spaceAfter=10,
            fontName='Helvetica'
        )
        for i, a in enumerate(advice, 1):
            story.append(Paragraph(f"<b>{i}.</b> {a}", action_style))
        story.append(Spacer(1, 0.2*inch))

    # Footer
    story.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle(
        'footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#9ca3af'),
        alignment=1,
        fontName='Helvetica-Oblique'
    )
    story.append(Paragraph("Military Emergency Triage System © 2026 | Authorized Personnel Only", footer_style))

    # Build PDF
    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=triage_report.pdf"}
    )
