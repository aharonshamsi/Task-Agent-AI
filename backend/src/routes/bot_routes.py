import os
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from flask import request, jsonify
from app import app
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.functions.event_function import get_events_function
from src.functions import FUNCTION_DEFINITIONS, FUNCTION_MAP

from openai import OpenAI
from config import Config

from zep_python import ZepClient, Memory, Message

os.environ["NO_PROXY"] = "127.0.0.1,localhost"

client = OpenAI(api_key=Config.OPENAI_API_KEY)
zep = ZepClient(base_url="http://127.0.0.1:8000")


@app.route("/bot", methods=["POST"])
@jwt_required()
def bot_chat():
    current_user_id = int(get_jwt_identity())
    user_message = request.json.get("message")

    if not user_message:
        return jsonify({"error": "Missing message"}), 400

    session_id = f"user_{current_user_id}"

    # ================== SAVE USER ==================
    try:
        user_msg_obj = Message(role="user", content=user_message)
        zep.memory.add_memory(session_id, Memory(messages=[user_msg_obj]))

    except Exception as e:
        print(f"Zep Add Memory Error: {e}")

    # ================== HISTORY ==================
    history_messages = []
    try:
        memory_data = zep.memory.get_memory(session_id)
        if memory_data and memory_data.messages:
            for msg in memory_data.messages[-10:]:
                history_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
    except Exception as e:
        print(f"Zep Get Memory Error: {e}")

    # ================== TIME ==================
    now_il = datetime.now(ZoneInfo("Asia/Jerusalem"))
    today_iso = now_il.date().isoformat()
    current_time_iso = now_il.isoformat(timespec='minutes')

    # ================== EVENTS ==================
    try:
        start_date_str = (now_il - timedelta(days=30)).isoformat()
        end_date_str = (now_il + timedelta(days=30)).isoformat()
        events = get_events_function(current_user_id, start_date_str, end_date_str)
        events = events[:20]  # limit tokens
    except Exception as e:
        print(f"Event Fetch Error: {e}")
        events = []

    # ================== PROMPT ==================
    system_prompt = f"""
        You are a smart personal diary assistant.

        Today is {today_iso}, current time is {current_time_iso}.
        Timezone: Asia/Jerusalem.

        You manage calendar events.

        RULES:
        - When updating or deleting → MUST include event_id from the list.
        - NEVER invent event_id.
        - If unsure → do NOT call function.

        - update_event args:
        {{
            "event_id": number,
            "data": {{...}}
        }}

        - delete_event args:
        {{
            "event_id": number
        }}

        User may refer indirectly ("הפגישה", "זה", "אותו").

        Events:
        {json.dumps(events, ensure_ascii=False)}
        """

    # ================== MODEL ==================
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            *history_messages,
            {"role": "user", "content": user_message}
        ],
        functions=FUNCTION_DEFINITIONS,
        function_call="auto"
    )

    message = response.choices[0].message

    print("RAW FUNCTION:", message.function_call)

    # ================== FUNCTION ==================
    if message.function_call:
        function_name = message.function_call.name

        try:
            raw_args = message.function_call.arguments or "{}"
            print("RAW ARGS:", raw_args)
            args = json.loads(raw_args)
        except Exception as e:
            print("JSON ERROR:", e)
            return jsonify({"reply": "שגיאה בפענוח הבקשה"}), 200

        function_to_call = FUNCTION_MAP.get(function_name)

        if not function_to_call:
            return jsonify({"reply": "פונקציה לא מוכרת"}), 200

        # ================== VALIDATION ==================
        if function_name in ("update_event", "delete_event"):
            if "event_id" not in args:
                print("Missing event_id → fallback")

                # ===== fallback logic =====
                try:
                    fallback_id = events[0]["id"] if events else None
                    if not fallback_id:
                        return jsonify({"reply": "לא הצלחתי לזהות אירוע"}), 200

                    args["event_id"] = fallback_id

                except Exception as e:
                    print("Fallback failed:", e)
                    return jsonify({"reply": "שגיאה בזיהוי האירוע"}), 200

        if function_name == "update_event":
            if "data" not in args:
                args["data"] = {}

        # ================== EXECUTE ==================
        try:
            result = function_to_call(user_id=current_user_id, **args)
        except Exception as e:
            print("Function crash:", e)
            return jsonify({"reply": "שגיאה בביצוע הפעולה"}), 200

        # ================== RESPONSE ==================
        if function_name == "add_event":
            reply = f"האירוע נוסף בהצלחה: {result.get('title', '')}"

        elif function_name == "delete_event":
            reply = "האירוע נמחק בהצלחה"

        elif function_name == "update_event":
            reply = "האירוע עודכן בהצלחה"

        elif function_name == "get_events":
            second = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "ענה בעברית בקצרה"},
                    {
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(result, ensure_ascii=False)
                    }
                ]
            )
            reply = second.choices[0].message.content

        else:
            reply = "בוצע בהצלחה"

    else:
        reply = message.content if message.content else "לא זוהתה פעולה"

    # ================== SAVE ASSISTANT ==================
    try:
        zep.memory.add_memory(session_id, Memory(messages=[
            Message(role="assistant", content=reply)
        ]))
    except Exception as e:
        print(f"Zep Save Error: {e}")

    return jsonify({"reply": reply}), 200
