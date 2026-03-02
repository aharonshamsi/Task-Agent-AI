
from src.services.event_service import fetch_user_events, create_event, execute_deletion, execute_update_event
from datetime import datetime

#========== Get events ========================================
def get_events_function(user_id: int, start_date: datetime, end_date: datetime):
    return fetch_user_events(user_id, start_date, end_date)


get_events_definition = {
    "name": "get_events",
    "description": (
    "Retrieve user events. IMPORTANT: If the user asks a general question like 'what are my events?', "
    "set start_date to the beginning of today and end_date to 14 days from now. "
    "Always return events in a valid ISO format."
        ),
    "parameters": {
        "type": "object",
        "properties": {
            "start_date": {
                "type": "string",
                "description": (
                    "Start of the time range as an ISO datetime. "
                    "Example: 2026-01-02T00:00:00+02:00"
                )
            },
            "end_date": {
                "type": "string",
                "description": (
                    "End of the time range as an ISO datetime. "
                    "Example: 2026-01-02T23:59:59+02:00"
                )
            }
        },
        "required": ["start_date", "end_date"]
    }
}





#========== Add event ========================================
def add_event_function(user_id: int, title: str, start_time: str,description: str | None = None, end_time: str | None = None):

    try:
        # convert ISO strings to datetime
        start_dt = datetime.fromisoformat(start_time)
        end_dt = datetime.fromisoformat(end_time) if end_time else None
    except ValueError:
        raise ValueError("Invalid datetime format. Must be ISO format.")

    data = {
        "title": title,
        "start_time": start_dt,
        "description": description,
        "end_time": end_dt
    }

    # create_event inserts into DB and returns JSON
    return create_event(user_id, data)



# Definition for OpenAI function calling
add_event_definition = {
    "name": "add_event",
    "description": "Add a new event. Use exact ISO format.",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "start_time": {
                "type": "string",
                "description": (
                    "Exact ISO 8601 datetime. IMPORTANT: Today is Monday, Feb 23 2026. "
                    "If user says 'tomorrow', it is 2026-02-24. "
                    "Always use YYYY-MM-DD format."
                )
            },
            "end_time": {"type": "string"}
        },
        "required": ["title", "start_time"]
    }
}







# ========= DELETE EVENT =========
def delete_event_function(user_id: int, event_id: int):
    print(user_id + event_id)
    execute_deletion(user_id, event_id)
    return {
        "status": "success",
        "event_id": event_id
    }

delete_event_definition = {
    "name": "delete_event",
    "description": (
        "Delete an event. MUST return event_id from the list."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "event_id": {
                "type": "integer",
                "description": "ID of the event to delete"
            }
        },
        "required": ["event_id"]
    }
}





# ========= UPDATE EVENT =========
def update_event_function(user_id: int, event_id: int, data: dict):

    # Validate data fields
    valid_data = {}

    if 'title' in data:
        valid_data['title'] = str(data['title'])

    if 'description' in data:
        valid_data['description'] = str(data['description'])

    if 'start_time' in data:
        # convert ISO string to datetime
        try:
            valid_data['start_time'] = datetime.fromisoformat(data['start_time'])
        except ValueError:
            raise ValueError("Invalid start_time format, must be ISO datetime")

    if 'end_time' in data:
        try:
            valid_data['end_time'] = datetime.fromisoformat(data['end_time'])
        except ValueError:
            raise ValueError("Invalid end_time format, must be ISO datetime")

    # Call repository / DB layer
    success = execute_update_event(user_id, event_id, valid_data)

    if not success:
        raise ValueError("Event not found or unauthorized for update.")

    return {
        "status": "success",
        "event_id": event_id
    }




update_event_definition = {
    "name": "update_event",
    "description": (
        "Update an existing event. MUST choose event_id from the provided events list. "
        "NEVER use event_hint."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "event_id": {
                "type": "integer",
                "description": "ID of the event מתוך הרשימה"
            },
            "data": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "start_time": {"type": "string"},
                    "end_time": {"type": "string"}
                }
            }
        },
        "required": ["event_id", "data"]
    }
}





