"""
InterviewLens — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import json, re, datetime

app = FastAPI(title="InterviewLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────

class AnswerInput(BaseModel):
    transcript: str
    question: str
    duration_seconds: Optional[int] = 0
    role: Optional[str] = "HR"

class ReportInput(BaseModel):
    answers: List[dict]
    setup: Optional[dict] = None

# ─── Analysis engine (mirrors frontend logic) ────────

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "literally",
    "actually", "so", "right", "okay", "well", "kind of", "sort of", "i mean"]

STRONG_INDICATORS = ["specifically", "for example", "as a result", "therefore",
    "i demonstrated", "i achieved", "i led", "i implemented", "i delivered",
    "the outcome was", "this resulted in", "i measured"]

WEAK_STARTERS = ["i don't know", "i'm not sure", "i guess", "maybe",
    "i think maybe", "probably", "i never", "i can't"]

def analyze_answer(transcript: str, question: str, duration: int = 0, role: str = "HR"):
    if not transcript or len(transcript.strip()) < 3:
        return {"confidence": 0, "communication": 0, "technical": 0,
                "quality": "Weak", "wordCount": 0, "fillerCount": 0,
                "suggestions": ["Please provide an answer."], "strengths": []}

    text = transcript.lower().strip()
    words = text.split()
    word_count = len(words)
    sentences = [s for s in re.split(r'[.!?]+', transcript) if len(s.strip()) > 3]

    # Fillers
    filler_count = sum(text.count(fw) for fw in FILLER_WORDS)
    filler_rate = filler_count / max(word_count, 1)

    # Indicators
    strong_count = sum(1 for si in STRONG_INDICATORS if si in text)
    weak_count = sum(1 for ws in WEAK_STARTERS if ws in text)

    # Pace
    pace = int((word_count / duration * 60)) if duration > 0 else 130

    # Confidence
    confidence = 65
    if filler_rate > 0.1: confidence -= 15
    elif filler_rate > 0.05: confidence -= 8
    if weak_count > 2: confidence -= 12
    elif weak_count > 0: confidence -= 5
    if strong_count >= 2: confidence += 10
    if word_count < 20: confidence -= 20
    elif word_count > 80: confidence += 8
    if pace > 180: confidence -= 10
    elif pace < 80: confidence -= 8
    confidence = max(5, min(95, confidence))

    # Communication
    communication = 60
    avg_sent_len = word_count / max(len(sentences), 1)
    if 8 < avg_sent_len < 25: communication += 10
    if word_count > 50: communication += 8
    if word_count > 100: communication += 5
    if "for example" in text or "for instance" in text: communication += 8
    communication = max(5, min(95, communication))

    # Technical
    technical = 55
    q_words = [w for w in question.lower().split() if len(w) > 4]
    relevant = [qw for qw in q_words if qw in text]
    relevance = len(relevant) / max(len(q_words), 1)
    technical += int(relevance * 20)
    if strong_count >= 1: technical += 8
    if word_count > 60: technical += 8
    technical = max(5, min(95, technical))

    avg = (confidence + communication + technical) / 3
    if avg >= 75: quality = "Strong"
    elif avg >= 60: quality = "Good"
    elif avg >= 45: quality = "Average"
    else: quality = "Weak"

    suggestions = []
    if filler_rate > 0.05: suggestions.append(f"Reduce filler words — detected {filler_count}")
    if word_count < 40: suggestions.append("Expand your answer — aim for 60-80+ words")
    if "for example" not in text: suggestions.append("Add a specific example using the STAR method")
    if weak_count > 0: suggestions.append("Replace hesitant phrases with confident statements")
    if not suggestions: suggestions.append("Good answer — practice delivering it even more fluently")

    strengths = []
    if filler_rate < 0.03: strengths.append("Very few filler words")
    if word_count > 80: strengths.append("Detailed, thorough answer")
    if strong_count >= 2: strengths.append("Used specific examples and evidence language")
    if not strengths: strengths.append("Relevant response provided")

    return {
        "confidence": confidence,
        "communication": communication,
        "technical": technical,
        "quality": quality,
        "wordCount": word_count,
        "fillerCount": filler_count,
        "pace": pace,
        "suggestions": suggestions,
        "strengths": strengths
    }

# ─── Routes ───────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "InterviewLens API v1.0", "status": "running"}

@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.post("/api/analyze")
def analyze(input: AnswerInput):
    """Analyze a single interview answer"""
    result = analyze_answer(
        input.transcript, input.question,
        input.duration_seconds, input.role
    )
    return result

@app.post("/api/report")
def generate_report(input: ReportInput):
    """Generate a final report from all answers"""
    answers = input.answers
    if not answers:
        raise HTTPException(status_code=400, detail="No answers provided")

    scores = [a.get("analysis", {}) for a in answers]
    avg_conf = int(sum(s.get("confidence", 50) for s in scores) / max(len(scores), 1))
    avg_comm = int(sum(s.get("communication", 50) for s in scores) / max(len(scores), 1))
    avg_tech = int(sum(s.get("technical", 50) for s in scores) / max(len(scores), 1))
    overall = int((avg_conf + avg_comm + avg_tech) / 3)

    if overall >= 75: readiness = "Job Ready"
    elif overall >= 55: readiness = "Intermediate"
    else: readiness = "Beginner"

    all_suggestions = list(set(s for a in scores for s in a.get("suggestions", [])))
    all_strengths = list(set(s for a in scores for s in a.get("strengths", [])))

    weak_areas = []
    if avg_conf < 60: weak_areas.append("Confidence & Delivery")
    if avg_comm < 60: weak_areas.append("Communication Clarity")
    if avg_tech < 60: weak_areas.append("Technical Depth")

    return {
        "overall": overall,
        "avgConfidence": avg_conf,
        "avgComm": avg_comm,
        "avgTech": avg_tech,
        "readiness": readiness,
        "weakAreas": weak_areas,
        "topStrengths": all_strengths[:4],
        "topSuggestions": all_suggestions[:5],
        "questionCount": len(answers)
    }

@app.get("/api/questions/{role}/{difficulty}")
def get_questions(role: str, difficulty: str, count: int = 5):
    """Get questions for a role/difficulty"""
    from questions_data import QUESTION_BANK
    pool = QUESTION_BANK.get(role, {}).get(difficulty, [])
    import random
    random.shuffle(pool)
    return {"questions": pool[:count], "role": role, "difficulty": difficulty}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
