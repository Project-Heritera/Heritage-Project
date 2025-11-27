from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """
    # The new score field is added directly to the User model
    profile_pic = models.ImageField(upload_to="Images/", blank=True)
    description = models.CharField(max_length=200, blank=True)

    def save(self, *args, **kwargs):
        if not self.profile_pic:
            from .utils import generate_avatar
            self.profile_pic = generate_avatar(self.username)

        if not self.description:
            self.description = "No description"

        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.username