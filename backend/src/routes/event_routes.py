# =========================================================
# Event Endpoints
# =========================================================
# Provides CRUD operations for user events.
# Each endpoint requires a valid JWT token.
# =========================================================

from flask import request, jsonify
from app import app, db
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.services.event_service import (
    create_event,
    fetch_user_events,
    execute_deletion,
    execute_update_event
)

# =========================================================
# Add Event
# =========================================================
@app.route("/event", methods=['POST'])
@jwt_required()
def add_event():
    """
    Creates a new event for the authenticated user.
    Required fields: title, start_time
    """
    current_user_id = int(get_jwt_identity())
    data = request.json

    if not data or 'title' not in data or 'start_time' not in data:
        return jsonify({"error": "Missing required data"}), 400

    try:
        new_event = create_event(current_user_id, data)
        return jsonify({
            "message": "Event added successfully!",
            "event_id": new_event.event_id
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================
# Get Events
# =========================================================
@app.route("/event", methods=['GET'])
@jwt_required()
def get_event():
    """
    Retrieves events for the authenticated user.
    Optional query param: date (ISO format)
    """
    current_user_id = int(get_jwt_identity())
    date = request.args.get('date')

    try:
        events_output = fetch_user_events(current_user_id, date)
        return jsonify({"events": events_output}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500


# =========================================================
# Delete Event
# =========================================================
@app.route("/event", methods=['DELETE'])
@jwt_required()
def delete_event():
    """
    Deletes a specific event by event_id for the authenticated user.
    Query param: event_id
    """
    current_user_id = int(get_jwt_identity())
    event_id = request.args.get('event_id')

    if not event_id:
        return jsonify({"error": "Missing event_id"}), 400

    try:
        execute_deletion(current_user_id, event_id)
        return jsonify({"message": "Event deleted successfully!"}), 200

    except ValueError as e:
        # Not found / unauthorized
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500


# =========================================================
# Update Event
# =========================================================
@app.route("/event", methods=['PUT'])
@jwt_required()
def update_event():
    """
    Updates a specific event for the authenticated user.
    Query param: event_id
    JSON body: fields to update
    """
    current_user_id = int(get_jwt_identity())
    event_id = request.args.get('event_id')
    data = request.json

    if not event_id:
        return jsonify({"error": "Missing event_id"}), 400
    if not data:
        return jsonify({"error": "No data provided for update"}), 400

    try:
        execute_update_event(current_user_id, event_id, data)
        return jsonify({"message": "Event updated successfully!"}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500