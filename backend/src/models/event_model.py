# =========================================================
# Event Model
# =========================================================
# Represents a calendar event belonging to a user.
# =========================================================

from app import db


class Event(db.Model):
    __tablename__ = 'events'

    # ---------------------------
    # Primary Key
    # ---------------------------
    event_id = db.Column(db.Integer, primary_key=True)

    # ---------------------------
    # Foreign Keys
    # ---------------------------
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.user_id'),
        nullable=False
    )

    # ---------------------------
    # Event Details
    # ---------------------------
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)

    # ---------------------------
    # Metadata
    # ---------------------------
    created_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp()
    )