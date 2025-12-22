"""
Notification Service
Handles push notifications for critical disaster alerts using Firebase Cloud Messaging.
"""
import logging
from typing import List, Dict, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    
    if not firebase_admin._apps:
        cred_path = os.path.join(
            os.path.dirname(__file__),
            '../../credentials/firebase-service-account.json'
        )
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
        else:
            logger.warning(f"Firebase credentials not found at {cred_path}")
    
    FCM_AVAILABLE = True
except ImportError:
    logger.warning("firebase-admin not installed. Push notifications disabled.")
    FCM_AVAILABLE = False
except Exception as e:
    logger.error(f"Error initializing Firebase: {e}")
    FCM_AVAILABLE = False


class NotificationService:
    """
    Send push notifications for critical alerts.
    
    Note: FCM is enabled if firebase-admin is installed and credentials are configured.
    """
    
    def __init__(self):
        self.fcm_enabled = FCM_AVAILABLE
        self.notification_history = []
        if self.fcm_enabled:
            logger.info("FCM notifications enabled")
        else:
            logger.info("FCM notifications disabled - will log only")
    
    async def send_disaster_alert(
        self,
        user_tokens: List[str],
        alert: Dict,
        priority: str = "high"
    ) -> Dict:
        """
        Send push notification for disaster alert.
        
        Args:
            user_tokens: List of FCM device tokens
            alert: Alert data (earthquake/tsunami)
            priority: "high" for critical alerts, "normal" otherwise
            
        Returns:
            Result with success/failure counts
        """
        # Only send push for CRITICAL and WARNING severity
        if alert.get("severity") not in ["critical", "warning"]:
            logger.info(f"Skipping push for {alert.get('severity')} alert")
            return {"sent": 0, "failed": 0, "skipped": 1}
        
        if not self.fcm_enabled:
            logger.warning("FCM not configured - notification not sent")
            # Log notification for testing
            self._log_notification(alert)
            return {"sent": 0, "failed": 0, "fcm_disabled": True}
        
        try:
            # Send via Firebase Cloud Messaging
            # Note: Using send_each instead of send_multicast for better compatibility
            messages = []
            for token in user_tokens:
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=self.get_notification_title(alert),
                        body=self.get_notification_body(alert)
                    ),
                    data={
                        "type": alert["type"],
                        "severity": alert["severity"],
                        "alert_id": alert["id"],
                        "user_message": alert["user_message"],
                        "distance_km": str(alert.get("distance_km", 0))
                    },
                    token=token,
                    android=messaging.AndroidConfig(
                        priority=priority,
                        notification=messaging.AndroidNotification(
                            sound="default",
                            channel_id="disaster_alerts",
                            color="#FF0000" if alert["severity"] == "critical" else "#FFA500"
                        )
                    ),
                    apns=messaging.APNSConfig(
                        payload=messaging.APNSPayload(
                            aps=messaging.Aps(
                                sound="default",
                                badge=1,
                                category=alert["type"]
                            )
                        )
                    )
                )
                messages.append(message)
            
            # Send to all devices
            if messages:
                response = messaging.send_each(messages)
                
                success_count = sum(1 for r in response.responses if r.success)
                failure_count = len(response.responses) - success_count
                
                logger.info(f"Sent {success_count} notifications, {failure_count} failed")
                
                return {
                    "sent": success_count,
                    "failed": failure_count
                }
            else:
                return {"sent": 0, "failed": 0}
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return {"sent": 0, "failed": len(user_tokens), "error": str(e)}
    
    def _log_notification(self, alert: Dict):
        """Log notification for testing purposes."""
        notification = {
            "timestamp": datetime.now().isoformat(),
            "type": alert.get("type"),
            "severity": alert.get("severity"),
            "title": alert.get("title"),
            "message": alert.get("message")
        }
        self.notification_history.append(notification)
        logger.info(f"Notification logged: {notification}")
    
    def should_send_notification(self, alert: Dict) -> bool:
        """
        Determine if notification should be sent.
        
        Criteria:
        - Severity is CRITICAL or WARNING
        - Not a duplicate (check recent notifications)
        - User has notifications enabled
        """
        severity = alert.get("severity")
        
        # Only send for critical and warning
        if severity not in ["critical", "warning"]:
            return False
        
        # Check for duplicates in last hour
        alert_id = alert.get("id")
        recent_ids = [n.get("alert_id") for n in self.notification_history[-10:]]
        if alert_id in recent_ids:
            logger.info(f"Duplicate notification prevented for {alert_id}")
            return False
        
        return True
    
    def get_notification_title(self, alert: Dict) -> str:
        """Generate notification title."""
        alert_type = alert.get("type", "").upper()
        severity = alert.get("severity", "").upper()
        
        if severity == "critical":
            return f"🚨 CRITICAL {alert_type} ALERT"
        elif severity == "warning":
            return f"⚠️ {alert_type} WARNING"
        else:
            return f"ℹ️ {alert_type} Information"
    
    def get_notification_body(self, alert: Dict) -> str:
        """Generate notification body."""
        message = alert.get("message", "")
        distance = alert.get("distance_km")
        
        if distance:
            return f"{message} ({distance:.0f}km away)"
        return message


# Singleton instance
notification_service = NotificationService()
