from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """
    # The new score field is added directly to the User model
    profile_pic = models.ImageField(upload_to="Images/", blank=True)
    description = models.CharField(max_length=200, blank=True)
    streak = models.IntegerField(default=0)
    last_activity = models.DateField(null=True, blank=True)
    longest_streak = models.IntegerField(default=0)
    totp_secret = models.CharField(max_length=32, blank=True, null=True)

    def update_streak(self):
        """Call this whenever the user completes a streak-qualifying action."""
        today = timezone.localdate()

        # First action ever → initialize
        if not self.last_activity:
            self.last_activity = today
            self.streak = 1
            self.longest_streak = 1
            self.save()
            return

        # If user already acted today → no change
        if self.last_activity == today:
            return

        # If last action was yesterday → streak continues
        if self.last_activity == today - timezone.timedelta(days=1):
            self.streak += 1
        else:
            # Missed a day → reset streak
            self.streak = 0

        # Update longest streak
        if self.streak > self.longest_streak:
            self.longest_streak = self.streak

        self.last_activity = today
        self.save()

    def save(self, *args, **kwargs):
        if not self.profile_pic:
            from .utils import generate_avatar
            self.profile_pic = generate_avatar(self.username)

        if not self.description:
            self.description = "No description"

        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.username