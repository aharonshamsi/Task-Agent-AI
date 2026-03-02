# =========================================================
# Authentication Endpoint
# =========================================================
# Provides user login functionality and returns a JWT access token.
# =========================================================

from app import app
from flask import request, jsonify
from flask_jwt_extended import create_access_token
from src.services.auth_service import authenticate_user

# =========================================================
# Login Endpoint
# =========================================================
@app.route("/login", methods=["POST"])
def login():
    """
    Authenticates a user and returns a JWT access token.
    Required fields: username, password
    """
    data = request.json

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400

    try:
        user = authenticate_user(data["username"], data["password"])

        # Create JWT for the authenticated user
        token = create_access_token(identity=str(user.user_id))

        return jsonify({
            "message": "Login successful",
            "access_token": token
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500