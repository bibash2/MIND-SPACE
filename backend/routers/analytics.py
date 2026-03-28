from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from core.database import get_db
from core.security import get_current_user
from models.schemas import AnalyticsSummary, MoodDataPoint

router = APIRouter()


def _as_utc_dt(dt: datetime) -> datetime:
    """BSON datetimes may be naive UTC or tz-aware; normalize for comparisons."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(current_user: dict = Depends(get_current_user)):
    db = get_db()
    uid = current_user["_id"]

    # Newest first: charts use last 7/30 days; oldest-first + limit wrongly dropped recent rows
    entries = await db.journal_entries.find(
        {"user_id": uid}
    ).sort("created_at", -1).to_list(length=5000)

    if not entries:
        return AnalyticsSummary(
            total_entries=0,
            avg_polarity=0.0,
            most_common_mood="Neutral",
            streak_days=0,
            weekly_data=[],
            monthly_data=[],
            mood_distribution={"Positive": 0, "Neutral": 0, "Negative": 0},
        )

    total_entries = len(entries)
    polarities = [e["sentiment"]["polarity_score"] for e in entries]
    avg_polarity = round(sum(polarities) / len(polarities), 4)

    # Mood distribution
    mood_dist: dict = defaultdict(int)
    for e in entries:
        mood_dist[e["sentiment"]["label"]] += 1
    most_common_mood = max(mood_dist, key=mood_dist.get)

    # Streak calculation (calendar days in UTC)
    unique_dates = sorted(
        set(_as_utc_dt(e["created_at"]).date() for e in entries), reverse=True
    )
    streak = 0
    today = datetime.now(timezone.utc).date()
    for i, d in enumerate(unique_dates):
        if d == today - timedelta(days=i):
            streak += 1
        else:
            break

    # Weekly aggregation (last 7 days)
    weekly_data = _aggregate_by_day(entries, days=7)

    # Monthly aggregation (last 30 days)
    monthly_data = _aggregate_by_day(entries, days=30)

    return AnalyticsSummary(
        total_entries=total_entries,
        avg_polarity=avg_polarity,
        most_common_mood=most_common_mood,
        streak_days=streak,
        weekly_data=weekly_data,
        monthly_data=monthly_data,
        mood_distribution=dict(mood_dist),
    )


def _aggregate_by_day(entries: list, days: int) -> list:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=days)
    recent = [e for e in entries if _as_utc_dt(e["created_at"]) >= cutoff]

    day_map: dict = defaultdict(list)
    for e in recent:
        day_key = _as_utc_dt(e["created_at"]).strftime("%Y-%m-%d")
        day_map[day_key].append(e["sentiment"]["polarity_score"])

    result = []
    for date_str, scores in sorted(day_map.items()):
        avg = sum(scores) / len(scores)
        if avg >= 0.05:
            label = "Positive"
        elif avg <= -0.05:
            label = "Negative"
        else:
            label = "Neutral"
        result.append(
            MoodDataPoint(
                date=date_str,
                polarity_score=round(avg, 4),
                label=label,
                entry_count=len(scores),
            )
        )
    return result
