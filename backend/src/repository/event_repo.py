# =========================================================
# Event Repository
# =========================================================
# Provides low-level database operations for Event model.
# Handles CRUD operations: add, get, update, delete.
# =========================================================

from app import db
from sqlalchemy import select
from src.models.event_model import Event
from datetime import datetime
from typing import List, Optional


# =========================================================
# Add Event
# =========================================================
def add_event_by_id(new_event: Event) -> None:
    """
    Adds a new Event to the database.
    """
    db.session.add(new_event)  # Add to session
    db.session.commit()        # Commit to DB


# =========================================================
# Get Events by User
# =========================================================
def get_event_by_user(user_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Event]:
    """
    Retrieves events for a user within optional date range.
    """
    query = Event.query.filter_by(user_id=user_id)

    if start_date:
        query = query.filter(Event.start_time >= start_date)
    if end_date:
        query = query.filter(Event.start_time <= end_date)

    return query.all()


# =========================================================
# Delete Event
# =========================================================
def delete_event_by_ids(user_id: int, event_id: int) -> bool:
    """
    Deletes a specific event by event_id for the given user.
    Returns True if deletion was successful, False otherwise.
    """
    event_to_delete = db.session.execute(
        select(Event).filter_by(event_id=event_id, user_id=user_id)
    ).scalar_one_or_none()

    if event_to_delete:
        db.session.delete(event_to_delete)
        db.session.commit()
        return True

    return False


# =========================================================
# Update Event
# =========================================================
def update_event_by_ids(current_user_id: int, event_id: int, new_data: dict) -> bool:
    """
    Updates the specified fields of an event belonging to the user.
    Returns True if update was successful, False if event not found.
    """
    event = Event.query.filter_by(event_id=event_id, user_id=current_user_id).first()

    if not event:
        return False

    if 'title' in new_data:
        event.title = new_data['title']
    if 'description' in new_data:
        event.description = new_data['description']
    if 'start_time' in new_data:
        event.start_time = new_data['start_time']
    if 'end_time' in new_data:
        event.end_time = new_data['end_time']

    db.session.commit()
    return True