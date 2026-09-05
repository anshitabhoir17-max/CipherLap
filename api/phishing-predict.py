import json
import re
from http.server import BaseHTTPRequestHandler
from pathlib import Path

import joblib


ROOT = Path(__file__).resolve().parents[1]
MODEL = joblib.load(ROOT / "ml" / "phishing_model.pkl")
VECTORIZER = joblib.load(ROOT / "ml" / "tfidf_vectorizer.pkl")


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    return " ".join(text.split())


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", "0"))
            if length > 250000:
                self.send_error(413, "Email content is too large.")
                return
            body = json.loads(self.rfile.read(length) or b"{}")
            text = str(body.get("text", "")).strip()
            if not text:
                self.send_error(400, "Paste email text or headers first.")
                return
            features = VECTORIZER.transform([clean_text(text)])
            prediction = int(MODEL.predict(features)[0])
            probabilities = MODEL.predict_proba(features)[0].tolist()
            result = {
                "prediction": "phishing" if prediction == 1 else "legitimate",
                "phishingProbability": round((probabilities[1] if len(probabilities) > 1 else prediction) * 100, 2),
                "model": "MLPClassifier + TF-IDF",
            }
            payload = json.dumps(result).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception:
            self.send_error(503, "The phishing model is unavailable.")
