from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class RequestManager(models.Manager):
    def filter(self, username: str):
        return super().filter(to_user__username=username, seen=False)


class Friendship(models.Model):
    ACCEPTED = "ACC"
    REJECTED = "REJ"
    PENDING = "PND"
    CANCELLED = "CNC"
    STATUS_CHOICES = [
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
        (PENDING, "Pending"),
        (CANCELLED, "Cancelled"),
    ]
    from_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friendships_sent"
    )
    to_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friendships_received"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
    )

    def __str__(self):
        return f"{self.from_user} to {self.to_user} - {self.status}"


class FriendRequest(models.Model):
    from_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friend_requests_sent"
    )
    to_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friend_requests_received"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)
    objects = models.Manager()
    unseen_requests = RequestManager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.from_user} to {self.to_user}"


class Block(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocks")
    blocked = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocked_by"
    )
