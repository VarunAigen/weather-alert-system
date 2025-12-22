"""
Users API router.
Handles user device tokens for push notifications.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


class DeviceToken(BaseModel):
    user_id: str
    token: str
    platform: str = "expo"


# In-memory storage (replace with database in production)
device_tokens: dict[str, List[str]] = {}


@router.post("/device-token")
async def register_device_token(data: DeviceToken):
    """
    Register or update user's device token for push notifications.
    
    Args:
        user_id: Firebase user ID
        token: Expo push token
        platform: Platform type (expo, android, ios)
    """
    try:
        # Store token (in production, save to database)
        if data.user_id not in device_tokens:
            device_tokens[data.user_id] = []
        
        # Avoid duplicates
        if data.token not in device_tokens[data.user_id]:
            device_tokens[data.user_id].append(data.token)
        
        logger.info(f"Registered device token for user {data.user_id}")
        
        return {
            "success": True,
            "message": "Device token registered successfully",
            "token_count": len(device_tokens[data.user_id])
        }
        
    except Exception as e:
        logger.error(f"Error registering device token: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/device-tokens/{user_id}")
async def get_user_tokens(user_id: str):
    """Get all device tokens for a user."""
    tokens = device_tokens.get(user_id, [])
    return {
        "user_id": user_id,
        "tokens": tokens,
        "count": len(tokens)
    }


@router.delete("/device-token")
async def remove_device_token(user_id: str, token: str):
    """Remove a device token."""
    try:
        if user_id in device_tokens and token in device_tokens[user_id]:
            device_tokens[user_id].remove(token)
            logger.info(f"Removed device token for user {user_id}")
            return {"success": True, "message": "Token removed"}
        
        return {"success": False, "message": "Token not found"}
        
    except Exception as e:
        logger.error(f"Error removing device token: {e}")
        raise HTTPException(status_code=500, detail=str(e))
