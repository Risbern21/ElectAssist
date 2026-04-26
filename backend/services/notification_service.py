from firebase_admin import messaging, firestore

class NotificationService:
    def __init__(self):
        self.db = firestore.client()

    async def send_election_reminder(self, user_id: str, message_title: str, message_body: str):
        """
        Retrieves the user's FCM token from Firestore and sends a push notification.
        """
        # Fetch user's FCM token
        user_doc = self.db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return False
            
        data = user_doc.to_dict()
        fcm_token = data.get('fcm_token')
        
        if not fcm_token:
            return False

        message = messaging.Message(
            notification=messaging.Notification(
                title=message_title,
                body=message_body,
            ),
            token=fcm_token,
        )

        try:
            response = messaging.send(message)
            print('Successfully sent message:', response)
            return True
        except Exception as e:
            print(f"Error sending FCM message: {e}")
            return False

    async def broadcast_to_ward(self, ward: str, message_title: str, message_body: str):
        """
        Sends a notification to all users subscribed to a specific ward topic.
        """
        topic = ward.replace(" ", "_").lower()
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=message_title,
                body=message_body,
            ),
            topic=topic,
        )

        try:
            response = messaging.send(message)
            print('Successfully broadcasted message:', response)
            return True
        except Exception as e:
            print(f"Error broadcasting FCM message: {e}")
            return False

notification_service = NotificationService()
