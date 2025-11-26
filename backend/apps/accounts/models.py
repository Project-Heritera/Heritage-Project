from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """
    # The new score field is added directly to the User model
    profile_pic = models.ImageField(upload_to="Images/", blank=True)
    description = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return self.username