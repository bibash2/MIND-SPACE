from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from core.database import get_db
from core.security import get_current_user
from models.schemas import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    SentimentResult,
)
from services.sentiment import analyze_sentiment

router = APIRouter()


def serialize_entry(entry: dict) -> JournalEntryResponse:
    sentiment_data = entry.get("sentiment", {})
    return JournalEntryResponse(
        id=str(entry["_id"]),
        user_id=str(entry["user_id"]),
        title=entry["title"],
        content=entry["content"],
        mood_label=entry.get("mood_label"),
        sentiment=SentimentResult(**sentiment_data),
        word_count=entry.get("word_count", 0),
        created_at=entry["created_at"],
        updated_at=entry["updated_at"],
    )


@router.post("/", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    data: JournalEntryCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    # Run AI sentiment analysis
    sentiment = analyze_sentiment(data.content)
    word_count = len(data.content.split())
    now = datetime.utcnow()

    doc = {
        "user_id": current_user["_id"],
        "title": data.title,
        "content": data.content,
        "mood_label": data.mood_label,
        "sentiment": sentiment,
        "word_count": word_count,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.journal_entries.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_entry(doc)


@router.get("/", response_model=List[JournalEntryResponse])
async def list_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    cursor = (
        db.journal_entries.find({"user_id": current_user["_id"]})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    entries = await cursor.to_list(length=limit)
    return [serialize_entry(e) for e in entries]


@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid entry ID")

    entry = await db.journal_entries.find_one(
        {"_id": oid, "user_id": current_user["_id"]}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return serialize_entry(entry)


@router.patch("/{entry_id}", response_model=JournalEntryResponse)
async def update_entry(
    entry_id: str,
    data: JournalEntryUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid entry ID")

    update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Re-analyse sentiment if content changed
    if "content" in update_fields:
        update_fields["sentiment"] = analyze_sentiment(update_fields["content"])
        update_fields["word_count"] = len(update_fields["content"].split())

    update_fields["updated_at"] = datetime.utcnow()

    result = await db.journal_entries.find_one_and_update(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$set": update_fields},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Entry not found")
    return serialize_entry(result)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid entry ID")

    result = await db.journal_entries.delete_one(
        {"_id": oid, "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
