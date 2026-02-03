from fastapi import APIRouter
from jose import jwt
from datetime import datetime, timedelta, timezone
from app.db.mongo import users
from app.config import JWT_SECRET, JWT_ALGO

# Create a FastAPI router
router = APIRouter()

@router.post("/login")
def login(phone: str):
    """
    Login endpoint:
    - Checks if a user exists by phone number.
    - Creates a new user if not found.
    - Returns a JWT token valid for 7 days.
    """
    # Search for the user in MongoDB
    user = users.find_one({"phone": phone})

    # If user does not exist, create a new one
    if not user:
        users.insert_one({
            "phone": phone,
            "created_at": datetime.now(timezone.utc)  # Correct UTC timestamp
        })

    # Generate JWT token valid for 7 days
    token = jwt.encode(
        {
            "phone": phone,
            "exp": datetime.utcnow() + timedelta(days=7)  # Expiration time
        },
        JWT_SECRET,
        algorithm=JWT_ALGO
    )

    # Return the token as JSON
    return {"token": token}
