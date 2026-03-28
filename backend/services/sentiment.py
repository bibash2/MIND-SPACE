"""
MindSpace AI Sentiment Analysis Service
Uses a hybrid approach:
  Primary  → Naïve Bayes Classifier (Scikit-Learn, TF-IDF vectorisation)
             trained on the Sentiment140 Twitter dataset pattern
  Secondary → VADER rule-based model (validation / ensemble)
Workflow: Tokenisation → TF-IDF Vectorisation → Prediction (polarity -1.0 to +1.0)
"""

import re
import string
import nltk
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import numpy as np
from typing import Dict

# Download required NLTK data silently
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", quiet=True)

try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords", quiet=True)

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

STOP_WORDS = set(stopwords.words("english"))
vader_analyzer = SentimentIntensityAnalyzer()

# ── Synthetic Training Data (representative patterns) ───────────────────────
# In production, replace with Sentiment140 dataset loader
TRAINING_DATA = [
    # Positive samples
    ("I feel absolutely wonderful and full of joy today!", "positive"),
    ("Had an amazing day, everything went perfectly!", "positive"),
    ("So grateful and happy for all the good things in my life", "positive"),
    ("Feeling motivated and excited about new opportunities", "positive"),
    ("Such a peaceful and beautiful morning, life is great", "positive"),
    ("Accomplished so much today, feeling proud and satisfied", "positive"),
    ("Love spending time with people who care about me", "positive"),
    ("This moment fills my heart with warmth and happiness", "positive"),
    ("Great progress on my goals, feeling hopeful about the future", "positive"),
    ("Energized and ready to take on any challenge", "positive"),
    ("Feeling content and at peace with where I am in life", "positive"),
    ("Today was a reminder of how much beauty exists in the world", "positive"),
    # Neutral samples
    ("Today was just another ordinary day, nothing special happened", "neutral"),
    ("Went through my routine tasks, things are okay", "neutral"),
    ("Nothing much to report, day was average", "neutral"),
    ("Did some work and errands today, feeling indifferent", "neutral"),
    ("Can't tell if things are good or bad, just moving through", "neutral"),
    ("Had a normal day, neither excited nor down about anything", "neutral"),
    ("Going through the motions today without strong feelings", "neutral"),
    # Negative samples
    ("Feeling really anxious and overwhelmed by everything today", "negative"),
    ("I am so exhausted and sad, nothing seems to be going right", "negative"),
    ("Struggling to find motivation, feeling hopeless and empty", "negative"),
    ("Had a terrible day, everything went wrong and I feel awful", "negative"),
    ("Feeling lonely and disconnected from everyone around me", "negative"),
    ("Stressed and frustrated, can't seem to catch a break", "negative"),
    ("So disappointed in myself, I failed again today", "negative"),
    ("Overwhelmed with worry and fear about the future", "negative"),
    ("Dark thoughts keep coming, I feel like I can't cope", "negative"),
    ("Crying a lot today, feeling deep sadness and grief", "negative"),
    ("Angry and resentful, nothing ever works out for me", "negative"),
    ("Feeling worthless and like a burden to everyone", "negative"),
]


def preprocess_text(text: str) -> str:
    """Tokenise, lowercase, remove punctuation/stopwords."""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    try:
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 1]
    return " ".join(tokens)


class SentimentAnalysisEngine:
    """Hybrid NB + VADER sentiment engine."""

    def __init__(self):
        self._build_model()

    def _build_model(self):
        texts = [preprocess_text(t) for t, _ in TRAINING_DATA]
        labels = [l for _, l in TRAINING_DATA]

        self.pipeline = Pipeline(
            [
                (
                    "tfidf",
                    TfidfVectorizer(
                        ngram_range=(1, 2),
                        max_features=5000,
                        sublinear_tf=True,
                    ),
                ),
                ("nb", MultinomialNB(alpha=0.5)),
            ]
        )
        self.pipeline.fit(texts, labels)
        self.label_encoder = {"positive": 1, "neutral": 0, "negative": -1}
        print("✅ Sentiment Analysis Engine initialised")

    def analyze(self, text: str) -> Dict:
        """
        Returns:
            polarity_score : float  -1.0 to +1.0
            label          : str    Positive | Neutral | Negative
            confidence     : float  0.0 to 1.0
            vader_compound : float
            emotions       : dict   VADER sub-scores
        """
        processed = preprocess_text(text)

        # Primary: Naïve Bayes
        nb_label: str = self.pipeline.predict([processed])[0]
        nb_proba = self.pipeline.predict_proba([processed])[0]
        nb_classes = self.pipeline.classes_
        nb_confidence = float(np.max(nb_proba))

        # Secondary: VADER
        vader_scores = vader_analyzer.polarity_scores(text)
        vader_compound = vader_scores["compound"]

        # Ensemble: weighted average of NB polarity + VADER compound
        nb_polarity = float(self.label_encoder.get(nb_label, 0))
        # Normalise NB polarity to -1..1 scale
        if nb_polarity > 0:
            nb_polarity_norm = nb_polarity * nb_confidence
        elif nb_polarity < 0:
            nb_polarity_norm = nb_polarity * nb_confidence
        else:
            nb_polarity_norm = 0.0

        ensemble_score = round(0.6 * nb_polarity_norm + 0.4 * vader_compound, 4)
        ensemble_score = max(-1.0, min(1.0, ensemble_score))

        # Final label from ensemble score
        if ensemble_score >= 0.05:
            final_label = "Positive"
        elif ensemble_score <= -0.05:
            final_label = "Negative"
        else:
            final_label = "Neutral"

        return {
            "polarity_score": ensemble_score,
            "label": final_label,
            "confidence": round(nb_confidence, 4),
            "vader_compound": round(vader_compound, 4),
            "emotions": {
                "positive": round(vader_scores["pos"], 4),
                "negative": round(vader_scores["neg"], 4),
                "neutral": round(vader_scores["neu"], 4),
            },
        }


# Singleton instance (loaded once at startup)
sentiment_engine = SentimentAnalysisEngine()


def analyze_sentiment(text: str) -> Dict:
    return sentiment_engine.analyze(text)
