#!/usr/bin/env python3
"""Skill: Grade Answer — StudyBuddy AI Personal Learning Agent.

Membaca file kuis (hasil generate-quiz) dan jawaban pengguna, menilai tiap
jawaban, lalu menyimpan skor & umpan balik ke data/grades/.  Python stdlib.

Pemakaian:
    python3 grade.py --quiz bab1-komputer --answers '{"1": 3, "2": 0, "3": 2}'
    python3 grade.py --quiz bab1-komputer --answers answer.json
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Agar modul _common (di ai/skills/) bisa diimpor saat script dijalankan langsung.
if str(Path(__file__).resolve().parents[1]) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from _common import DATA_DIR, resolve_json, slugify

QUIZ_DIR = DATA_DIR / "quizzes"
GRADE_DIR = DATA_DIR / "grades"


def load_answers(value: str) -> dict:
    """Jawaban bisa berupa string JSON atau path ke file .json."""
    candidate = Path(value)
    if candidate.exists():
        return json.loads(candidate.read_text(encoding="utf-8"))
    try:
        parsed = json.loads(value)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass
    raise ValueError("Jawaban harus berupa JSON objek atau path ke file JSON.")


def match_answer(q: dict, user_answer) -> tuple[bool, str]:
    """Kembalikan (benar?, jawaban_user_normalized)."""
    correct_index = q["answer_index"]
    options = q["options"]
    correct_text = q.get("answer") or options[correct_index]

    if isinstance(user_answer, int) or (
        isinstance(user_answer, str) and user_answer.strip().isdigit()
    ):
        idx = int(user_answer)
        if 0 <= idx < len(options):
            user_text = options[idx]
            return idx == correct_index, user_text
        return False, user_answer

    # jawaban berupa teks: normalisasi dan cocokkan (case-insensitive)
    user_text = str(user_answer).strip()
    norm_user = user_text.lower().strip(".")
    options_norm = [o.lower().strip(".") for o in options]
    return norm_user == options_norm[correct_index], user_text


def main(argv=None):
    parser = argparse.ArgumentParser(description="Grade answer StudyBuddy")
    parser.add_argument("--quiz", required=True,
                        help="Id/path file kuis (di data/quizzes/)")
    parser.add_argument("--answers", required=True,
                        help="String JSON jawaban atau path ke file JSON")
    parser.add_argument("--out-dir", default=str(GRADE_DIR),
                        help=f"Folder output (default: {GRADE_DIR})")
    args = parser.parse_args(argv)

    quiz_path = resolve_json(args.quiz, QUIZ_DIR)
    quiz = json.loads(quiz_path.read_text(encoding="utf-8"))
    answers = load_answers(args.answers)

    questions = quiz["questions"]
    results = []
    correct_count = 0
    for q in questions:
        qid = str(q["id"])
        user_ans = answers.get(qid, answers.get(int(qid) if qid.isdigit() else qid))
        is_correct, user_text = match_answer(q, user_ans if user_ans is not None else "")
        if is_correct:
            correct_count += 1
        results.append({
            "id": qid,
            "question": q["question"],
            "user_answer": user_text,
            "correct": is_correct,
            "correct_answer": q.get("answer") or q["options"][q["answer_index"]],
        })

    total = len(questions)
    percentage = round((correct_count / total * 100), 1) if total else 0
    now = datetime.now(timezone.utc).isoformat()
    source = quiz.get("source", quiz_path.stem)
    slug = slugify(source)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.json"
    payload = {
        "source": source,
        "results": results,
        "score": {
            "correct_count": correct_count,
            "total": total,
            "percentage": percentage,
        },
        "created_at": now,
    }
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(json.dumps({
        "ok": True,
        "path": str(out_path),
        "score": payload["score"],
        "results": results,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError, KeyError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
