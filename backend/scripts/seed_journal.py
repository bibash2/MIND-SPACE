"""
Seed MongoDB with highly varied random synthetic journal entries.

Usage (from backend/):
  python3 scripts/seed_journal.py
  python3 scripts/seed_journal.py --count 500 --days 180
  python3 scripts/seed_journal.py --clear
  python3 scripts/seed_journal.py --seed 99          # reproducible
  python3 scripts/seed_journal.py --no-seed          # different data every run

Docker:
  docker compose exec backend python scripts/seed_journal.py
"""

from __future__ import annotations

import argparse
import asyncio
import random
import secrets
import string
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from core.config import settings
from core.security import hash_password
from services.sentiment import TRAINING_DATA, analyze_sentiment

DEFAULT_EMAIL = "seed@mindspace.local"
DEFAULT_PASSWORD = "SeedPass123!"
DEFAULT_NAME = "Seed User"

MOOD_TAGS = [
    "gratitude",
    "anxiety",
    "calm",
    "stress",
    "hope",
    "focus",
    "growth",
    "grief",
    "energy",
    "rest",
    "anger",
    "joy",
    "loneliness",
    "curiosity",
    "overwhelm",
    "peace",
    "doubt",
    "pride",
    "shame",
    "relief",
    "anticipation",
    None,
    None,
]

TITLE_OPENERS = [
    "Morning notes",
    "Evening check-in",
    "Quick thoughts",
    "Today I felt",
    "Weekend reflection",
    "Midweek update",
    "Honest moment",
    "Small wins",
    "Hard day",
    "Gratitude list",
    "Brain dump",
    "One thing I noticed",
    "After work",
    "Before sleep",
    "Coffee and clarity",
    "3am thoughts",
    "Lunch break scribble",
    "Untitled",
    "Field notes",
    "Voice memo transcript",
    "Letters I won't send",
    "Weather report",
    "Mood: complicated",
    "Trying again",
]

TITLE_TOPICS = [
    "family",
    "work",
    "health",
    "friendship",
    "future plans",
    "boundaries",
    "creativity",
    "routine",
    "change",
    "patience",
    "self-talk",
    "rest",
    "courage",
    "kindness",
    "money",
    "identity",
    "dating",
    "therapy",
    "body image",
    "sleep",
    "noise",
    "silence",
]

TITLE_SUFFIXES = ["notes", "log", "moment", "check-in", "snapshot", "draft", "fragment", "entry"]

SENTENCE_OPENERS = [
    "Right now I feel",
    "I keep thinking about",
    "Something that helped today was",
    "I'm trying to remember that",
    "My body is telling me",
    "I didn't expect",
    "I'm proud that I",
    "It's hard to admit, but",
    "A small thing that mattered:",
    "I'm learning that",
    "I want to give myself credit for",
    "Noise in my head says",
    "What I actually need is",
    "If I'm honest,",
    "The part I don't say out loud:",
    "Underneath the story,",
    "Maybe it's okay that",
    "I keep circling back to",
]

SENTENCE_MIDDLES = [
    "taking things one hour at a time.",
    "reaching out even when it's awkward.",
    "not having all the answers yet.",
    "being gentler with myself than usual.",
    "noticing patterns I used to ignore.",
    "letting some things be unfinished.",
    "choosing rest without guilt.",
    "feeling lighter after a walk.",
    "wishing I could pause the week.",
    "celebrating a tiny bit of progress.",
    "wondering what's next.",
    "holding both worry and hope.",
    "naming the fear without obeying it.",
    "asking for clarity instead of certainty.",
    "staying curious instead of certain.",
]

SENTENCE_CLOSERS = [
    "Tomorrow I'll try again.",
    "That's enough for today.",
    "I'll sit with this a little longer.",
    "I don't have to fix everything tonight.",
    "Breathing helps more than I expect.",
    "I'm allowed to take up space.",
    "Small steps still count.",
    "I can ask for help.",
    "I'll protect my peace where I can.",
    "This feeling won't last forever.",
    "I'll drink water and revisit this.",
    "No verdict required.",
]

JOINERS = [
    "Also,",
    "Meanwhile,",
    "Separately,",
    "Another layer:",
    "On the other hand,",
    "What surprised me:",
    "The awkward part is",
    "If I zoom out,",
]

EMOTIONS = [
    "heavy",
    "light",
    "tender",
    "raw",
    "numb",
    "electric",
    "quiet",
    "restless",
    "hopeful",
    "bitter",
    "soft",
    "sharp",
]

EVENTS = [
    "a conversation I replayed",
    "a message I didn't send",
    "a boundary I held",
    "a mistake I made",
    "a compliment I deflected",
    "a deadline breathing down my neck",
    "a moment of unexpected kindness",
    "a song that cracked me open",
    "a room that felt too loud",
    "a walk with no destination",
]

PLACES = [
    "at home",
    "in the car",
    "on the train",
    "by the window",
    "in the shower",
    "at my desk",
    "in line at the store",
    "outside after dark",
]

QUESTION_STARTS = [
    "What if I'm not behind?",
    "Who gets to decide what's enough?",
    "What would kindness sound like here?",
    "What am I actually afraid of?",
    "Can I let this be messy?",
    "What would I tell a friend?",
]

_BASE_LINES = [t for t, _ in TRAINING_DATA]
_EXTRA_LINES = [
    "Took a short walk and noticed textures, sounds, light.",
    "Work was a lot; I still showed up.",
    "Called someone I trust; it shifted something.",
    "Sleep has been uneven—trying earlier wind-down.",
    "Journaling again after a long gap.",
    "Rain outside matched my mood for a minute.",
    "Finished one annoying task; relief is real.",
    "Uncertain about the next step, and that's okay.",
    "Coffee, quiet, a few deep breaths.",
    "Spiraling a bit—grounding with cold water and lists.",
    "Remembered I'm not my worst thought.",
    "Music helped more than scrolling.",
    "Said no to something; awkward but right.",
    "Yes to rest even when productivity screams.",
    "Random memory surfaced; I let it pass.",
    "Stretched for five minutes; body said thanks.",
    "Avoided email; guilt and relief mixed.",
    "Ate something warm; small anchor.",
    "Sunset stopped me on the sidewalk.",
]

_BODY_POOL = _BASE_LINES + _EXTRA_LINES


def _madlib_sentence(rng: random.Random) -> str:
    return (
        f"I felt {rng.choice(EMOTIONS)} thinking about {rng.choice(EVENTS)} {rng.choice(PLACES)}."
    )


def _synth_sentence(rng: random.Random) -> str:
    return f"{rng.choice(SENTENCE_OPENERS)} {rng.choice(SENTENCE_MIDDLES)}"


def _synth_with_joiner(rng: random.Random) -> str:
    a = _synth_sentence(rng)
    b = _synth_sentence(rng)
    b2 = b[0].lower() + b[1:] if b else b
    return f"{a.rstrip('.')}. {rng.choice(JOINERS)} {b2}"


def _question_line(rng: random.Random) -> str:
    return rng.choice(QUESTION_STARTS)


def _random_title(rng: random.Random) -> str:
    roll = rng.random()
    if roll < 0.28:
        return f"{rng.choice(TITLE_OPENERS)} — {rng.choice(TITLE_TOPICS)}"
    if roll < 0.48:
        return f"{rng.choice(TITLE_OPENERS)} #{rng.randint(1, 999)}"
    if roll < 0.62:
        return f"{rng.choice(TITLE_TOPICS).title()} · {rng.choice(TITLE_SUFFIXES)}"
    if roll < 0.78:
        return f"{rng.choice(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])} · {rng.choice(TITLE_TOPICS)}"
    if roll < 0.9:
        y = rng.randint(2024, 2026)
        m = rng.randint(1, 12)
        d = rng.randint(1, 28)
        return f"{y}-{m:02d}-{d:02d} {rng.choice(TITLE_OPENERS)}"
    return "".join(rng.choices(string.ascii_uppercase + string.digits, k=rng.randint(4, 8)))


def _pick_body_lines(rng: random.Random, k: int) -> list[str]:
    kk = min(k, len(_BODY_POOL))
    return rng.sample(_BODY_POOL, k=kk)


def _random_paragraph(rng: random.Random) -> str:
    """High-variance paragraph: random strategy mix and length."""
    parts: list[str] = []
    strategies = ["synth", "madlib", "pool", "joiner", "question", "closer"]
    n_blocks = rng.randint(2, 7)

    for _ in range(n_blocks):
        s = rng.choice(strategies)
        if s == "synth":
            parts.append(_synth_sentence(rng))
        elif s == "madlib":
            parts.append(_madlib_sentence(rng))
        elif s == "joiner" and rng.random() < 0.35:
            parts.append(_synth_with_joiner(rng))
        elif s == "question" and rng.random() < 0.45:
            parts.append(_question_line(rng))
        elif s == "closer":
            parts.append(rng.choice(SENTENCE_CLOSERS))
        else:
            parts.append(rng.choice(_BODY_POOL))

    extra_pool = rng.randint(0, 4)
    if extra_pool:
        parts.extend(_pick_body_lines(rng, min(extra_pool, 4)))

    if rng.random() < 0.5:
        rng.shuffle(parts)

    text = " ".join(parts)
    if rng.random() < 0.15:
        text = text.replace(". ", "; ")
    if rng.random() < 0.08:
        text = f"{rng.choice(['*', '', ''])} {text}"

    while "  " in text:
        text = text.replace("  ", " ")
    return text.strip()


def _random_timestamp(rng: random.Random, span_days: int) -> datetime:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=span_days)
    delta = (now - start).total_seconds()
    offset = rng.uniform(0, delta)
    return start + timedelta(seconds=offset)


def _jitter_updated_at(rng: random.Random, created: datetime) -> datetime:
    """Sometimes a bit later than created (edit / revisit)."""
    if rng.random() < 0.72:
        secs = rng.randint(0, min(96 * 3600, 4 * 24 * 3600))
        return created + timedelta(seconds=secs)
    return created


def _make_rng(seed: int | None) -> random.Random:
    r = random.Random()
    if seed is not None:
        r.seed(seed)
    else:
        r.seed(secrets.randbits(128))
    return r


async def _ensure_user(
    db,
    email: str,
    password: str,
    name: str,
) -> ObjectId:
    existing = await db.users.find_one({"email": email})
    if existing:
        return existing["_id"]
    now = datetime.now(timezone.utc)
    doc = {
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(doc)
    return result.inserted_id


async def _run() -> None:
    parser = argparse.ArgumentParser(
        description="Insert random journal entries into MongoDB",
    )
    parser.add_argument("--count", type=int, default=1000, help="How many entries")
    parser.add_argument("--email", default=DEFAULT_EMAIL, help="User email")
    parser.add_argument("--password", default=DEFAULT_PASSWORD, help="New user password")
    parser.add_argument("--name", default=DEFAULT_NAME, help="New user display name")
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Delete this user's journal entries before inserting",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=400,
        help="Spread created_at over this many days into the past",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        metavar="N",
        help="Fixed RNG seed for reproducible data (default: random each run)",
    )
    parser.add_argument(
        "--no-seed",
        action="store_true",
        help="Force non-deterministic RNG (overrides --seed)",
    )
    args = parser.parse_args()

    if args.count < 1:
        raise SystemExit("--count must be at least 1")
    if args.days < 1:
        raise SystemExit("--days must be at least 1")

    if args.no_seed:
        seed: int | None = None
    else:
        seed = args.seed

    rng = _make_rng(seed)

    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]

    uid = await _ensure_user(db, args.email, args.password, args.name)

    if args.clear:
        removed = await db.journal_entries.delete_many({"user_id": uid})
        print(f"Cleared {removed.deleted_count} entries for {args.email}")

    docs: list[dict] = []

    for _ in range(args.count):
        content = _random_paragraph(rng)
        sentiment = analyze_sentiment(content)
        created = _random_timestamp(rng, args.days)
        updated = _jitter_updated_at(rng, created)
        docs.append(
            {
                "user_id": uid,
                "title": _random_title(rng),
                "content": content,
                "mood_label": rng.choice(MOOD_TAGS),
                "sentiment": sentiment,
                "word_count": len(content.split()),
                "created_at": created,
                "updated_at": updated,
            }
        )

    await db.journal_entries.insert_many(docs)

    seed_note = f"seed={seed}" if seed is not None else "seed=random"
    print(
        f"Inserted {len(docs)} random journal entries → {args.email} "
        f"(user_id={uid}, span≈{args.days}d, {seed_note})."
    )

    client.close()


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
