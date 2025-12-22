"""
User preferences API endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict
from app.models.user import UserPreferences, PreferencesResponse

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

# In-memory storage (in production, use a database)
user_preferences_store: Dict[str, UserPreferences] = {}


@router.post("", response_model=PreferencesResponse)
async def save_preferences(preferences: UserPreferences):
    """
    Save user preferences.
    
    Stores user type, custom thresholds, and notification settings.
    """
    try:
        user_preferences_store[preferences.user_id] = preferences
        return PreferencesResponse(
            success=True,
            message="Preferences saved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save preferences: {str(e)}")


@router.get("/{user_id}", response_model=UserPreferences)
async def get_preferences(user_id: str):
    """
    Get user preferences by user ID.
    
    Returns stored preferences or default values if not found.
    """
    if user_id in user_preferences_store:
        return user_preferences_store[user_id]
    
    # Return default preferences if not found
    from app.models.user import UserType, CustomThresholds
    return UserPreferences(
        user_id=user_id,
        user_type=UserType.STUDENT,
        custom_thresholds=CustomThresholds(),
        notification_enabled=True,
        temperature_unit="celsius"
    )


@router.delete("/{user_id}")
async def delete_preferences(user_id: str):
    """
    Delete user preferences.
    """
    if user_id in user_preferences_store:
        del user_preferences_store[user_id]
        return {"success": True, "message": "Preferences deleted"}
    
    raise HTTPException(status_code=404, detail="User preferences not found")
