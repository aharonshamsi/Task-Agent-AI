# =========================================================
# User Repository
# =========================================================
# Provides low-level database operations for User model.
# Handles CRUD operations: add, update, delete.
# =========================================================

from app import db
from sqlalchemy import select
from src.models.user_model import User
from werkzeug.security import generate_password_hash
from typing import Dict, Any


# =========================================================
# Add User
# =========================================================
def insert_user(new_user: User) -> bool:
    """
    Inserts a new user into the database.
    Returns True if successful, False if an error occurs.
    """
    try:
        db.session.add(new_user)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()  # Undo all session changes
        return False


# =========================================================
# Delete User
# =========================================================
def delete_user_by_id(user_id: int) -> bool:
    """
    Deletes a user by user_id.
    Returns True if deletion was successful, False if user not found.
    """
    user_to_delete = db.session.execute(
        select(User).filter_by(user_id=user_id)
    ).scalar_one_or_none()

    if user_to_delete:
        db.session.delete(user_to_delete)
        db.session.commit()
        return True

    return False


# =========================================================
# Update User
# =========================================================
def update_user_by_id(user_id: int, clean_data: Dict[str, Any]) -> bool:
    """
    Updates the user's fields if provided in clean_data.
    Fields: username, email, password (hashed automatically)
    Returns True if update successful, False otherwise.
    """
    user = User.query.filter_by(user_id=user_id).first()

    if not user or not clean_data:
        return False

    if 'username' in clean_data:
        user.username = clean_data['username']

    if 'email' in clean_data:
        user.email = clean_data['email']

    if 'password' in clean_data:
        password_hash = generate_password_hash(clean_data['password'])
        user.password_hash = password_hash

    db.session.commit()
    return True