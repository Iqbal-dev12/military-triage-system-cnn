import random

CLASSES = ["Green", "Yellow", "Red", "Black"]

def predict_audio(audio_bytes: bytes):
    """
    Temporary audio predictor (stub).
    Replace later with real model.
    """

    probs = {
        "Green": random.random(),
        "Yellow": random.random(),
        "Red": random.random(),
        "Black": random.random(),
    }

    total = sum(probs.values())
    probs = {k: v / total for k, v in probs.items()}

    label = max(probs, key=probs.get)

    return {
        "label": label,
        "confidence": probs[label],
        "probabilities": probs
    }
