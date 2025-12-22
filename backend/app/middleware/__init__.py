"""
Authentication middleware for verifying Firebase ID tokens.
"""
from fastapi import Header, HTTPException, Depends
from typing import Optional
import os

# For now, we'll use a simple header-based auth
# In production, integrate with Firebase Admin SDK

async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract and verify user ID from authorization header.
    
    For demo/development: Accepts 'Bearer <user_email>' format
    For production: Should verify Firebase ID token
    
    Args:
        authorization: Authorization header with format 'Bearer <token>'
        
    Returns:
        user_id: The authenticated user's ID (email for now)
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not authorization:
        # For backward compatibility during migration, return default user
        return "user_default"
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use 'Bearer <token>'"
        )
    
    token = authorization.split("Bearer ")[1].strip()
    
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token"
        )
    
    # For demo: Use email as user_id
    # In production: Verify Firebase token and extract uid
    # try:
    #     from firebase_admin import auth
    #     decoded_token = auth.verify_id_token(token)
    #     user_id = decoded_token['uid']
    #     return user_id
    # except Exception as e:
    #     raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    # For now, accept email as user_id
    user_id = token
    return user_id


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Get user ID if provided, otherwise return None.
    Used for endpoints that work with or without authentication.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
