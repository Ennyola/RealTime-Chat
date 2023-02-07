from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Friendship(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_sent")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_received")
    status = models.CharField(max_length=10, choices=[
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ])

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_requests_sent")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_requests_received")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
class Block(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocks")
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_by")