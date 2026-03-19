
from src.services.event_service import fetch_user_events, create_event, execute_deletion, execute_update_event
from datetime import datetime

#========== Get events ========================================
def get_events_function(user_id: int, start_date: datetime, end_date: datetime):
    return fetch_user_events(user_id, start_date, end_date)


get_events_definition = {
    "name": "get_events",
    "description": (
        "Retrieve user events within a specific time range.\n\n"

        "CRITICAL RULES:\n"
        "- NEVER return events that occur before the start_date.\n"
        "- The function MUST only return events between start_date and end_date (inclusive).\n"
        "- If the user asks about upcoming events (e.g., 'next events', 'coming up', 'this month'), "
        "start_date MUST be set to the beginning of today (current datetime).\n"

        "DEFAULT BEHAVIOR:\n"
        "- For general queries like 'what are my events?', set start_date to now and end_date to 14 days from now.\n"
        "- For queries like 'this month' or 'next month', adjust end_date accordingly (e.g., 30 days range).\n"

        "All dates must be valid ISO datetime strings with timezone.\n"
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "start_date": {
                "type": "string",
                "description": (
                    "Start of the time range (inclusive) as ISO datetime. "
                    "Example: 2026-01-02T00:00:00+02:00"
                )
            },
            "end_date": {
                "type": "string",
                "description": (
                    "End of the time range (inclusive) as ISO datetime. "
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
        "Update an existing event.\n\n"

        "CRITICAL RULES:\n"
        "- MUST use this function when the user corrects or modifies a previously mentioned event.\n"
        "- Phrases like 'actually', 'change it', 'update', 'instead', or 'it should be' indicate an update.\n"
        "- If the user refers to the last created or discussed event, use that event's ID.\n"
        "- MUST choose event_id from the provided events list.\n"
        "- NEVER use event_hint.\n"
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




