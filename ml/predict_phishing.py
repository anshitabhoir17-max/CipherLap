import json
import re
import sys

import joblib


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    return " ".join(text.split())


def main():
    model = joblib.load(sys.argv[1])
    vectorizer = joblib.load(sys.argv[2])
    request = json.load(sys.stdin)
    text = request.get("text", "")
    cleaned = clean_text(text)
    features = vectorizer.transform([cleaned])
    prediction = int(model.predict(features)[0])
    probabilities = model.predict_proba(features)[0].tolist()
    phishing_probability = probabilities[1] if len(probabilities) > 1 else float(prediction)
    print(json.dumps({
        "prediction": "phishing" if prediction == 1 else "legitimate",
        "phishingProbability": round(phishing_probability * 100, 2),
        "model": "MLPClassifier + TF-IDF",
    }))


if __name__ == "__main__":
    main()
