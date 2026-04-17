from transformers import pipeline

# Pretrained classifier
classifier = pipeline(
    "text-classification",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

def analyze_text(text):
    """
    Returns triage distribution from text
    """

    result = classifier(text)[0]

    label = result["label"]
    score = result["score"]

    if label == "NEGATIVE":
        # serious condition
        return "Red", score
    else:
        # mild
        return "Green", score
