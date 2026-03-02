# =========================================================
# User Endpoints
# =========================================================
# Provides CRUD operations for user accounts.
# Note: Creation does not require authentication,
#       while update and deletion require a valid JWT.
# =========================================================

from flask import request, jsonify
from app import app
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.services.user_service import create_user, execute_deletion, execute_update

# =========================================================
# Add User
# =========================================================
@app.route("/user", methods=['POST'])
def add_user():
    """
    Registers a new user.
    Required fields: username, email, password
    """
    data = request.json

    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing required data"}), 400

    try:
        new_user = create_user(data)
        return jsonify({
            'message': "User added successfully!",
            'user_id': new_user.user_id
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500


# =========================================================
# Delete User
# =========================================================
@app.route("/user", methods=['DELETE'])
@jwt_required()
def delete_user():
    """
    Deletes the authenticated user's account.
    Requires JWT token.
    """
    current_user_id = get_jwt_identity()

    try:
        execute_deletion(current_user_id)
        return jsonify({"message": "User deleted successfully!"}), 204

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500


# =========================================================
# Update User
# =========================================================
@app.route("/user", methods=['PUT'])
@jwt_required()
def update_user():
    """
    Updates the authenticated user's account information.
    Requires JWT token.
    """
    current_user_id = int(get_jwt_identity())
    data = request.json

    if not data:
        return jsonify({"error": "No data provided for update"}), 400

    try:
        execute_update(current_user_id, data)
        return jsonify({"message": "User updated successfully!"}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500