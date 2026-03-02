from datetime import datetime
from src.models.event_model import Event
from src.repository.event_repo import delete_event_by_ids
from src.repository.event_repo import get_event_by_user
from src.repository.event_repo import add_event_by_id
from src.repository.event_repo import update_event_by_ids


import re
from datetime import datetime
from dateutil.relativedelta import relativedelta


#=====================================================
def create_event(current_user_id: int, data: dict) -> dict:

    new_event = Event(
        user_id=current_user_id,
        title=data["title"],
        start_time=data["start_time"],
        description=data.get("description"),
        end_time=data.get("end_time")
    )

    add_event_by_id(new_event)  # commit DB

    return {
        "user_id": new_event.user_id,
        "title": new_event.title,
        "start_time": new_event.start_time.isoformat(),
        "description": new_event.description,
        "end_time": new_event.end_time.isoformat() if new_event.end_time else None
    }





#=========================================================

def fetch_user_events(user_id: str, start_date: str, end_date: str) -> list[dict]:
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise ValueError("Invalid user ID")

    try:
        from datetime import datetime
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
    except ValueError:
        raise ValueError("Invalid date format. Expected ISO format")

    events_list = get_event_by_user(
        user_id=user_id_int,
        start_date=start,
        end_date=end
    )

    output_events = []
    for event in events_list:
        output_events.append({
            "event_id": event.event_id,
            "title": event.title,
            "start_time": event.start_time.isoformat(),
            "end_time": event.end_time.isoformat() if event.end_time else None,
            "description": event.description,
        })

    # indent=4 יוצר רווחים, ו-ensure_ascii=False מאפשר להדפיס עברית כראוי
    import json
    print(json.dumps(output_events, indent=4, ensure_ascii=False))

    return output_events





def execute_deletion(current_user_id: int, event_id: str) -> None:

    try:
        event_id_int = int(event_id)

    except ValueError:
        # מעלים שגיאה גנרית כדי שה-Route יטפל ב-400
        raise ValueError("Invalid ID format provided.") # 400
        
    # 2. קריאה ל-Repository לבצע את המחיקה
    success = delete_event_by_ids(current_user_id, event_id_int)
    
    # 3. טיפול בתוצאה: אם המחסנאי נכשל, מעלים שגיאה מפורטת
    if not success:
        # במקום להחזיר True/False, אנחנו מעלים שגיאה ספציפית
        raise ValueError("Event not found or unauthorized for deletion.")




def execute_update_event(current_user_id: int, event_id: str, new_data: dict) -> bool:

    try:
        event_id_int = int(event_id)
    except ValueError:
        raise ValueError("Invalid event ID format")

    return update_event_by_ids(current_user_id, event_id_int, new_data)
