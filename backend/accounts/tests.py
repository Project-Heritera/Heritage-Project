from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status

# Create your tests here.
class LoginSystemAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username="TestingAdmin",email="admin@example.com", password="testingdminpass")
        self.normal_user = User.objects.create_user(username="TestingUser", email="user@example.com", password="testinguserpass")
        #test data im creating
        self.testLogin = User.objects.create(
            username="django_lover6969",
            email="i_love_microplastics@microplastics.com",
            date_joined=timezone.now()
        )
        self.testLogin.set_password("django_be_like")
        self.testLogin.save()

    def test_change_password(self):
        #path to funciton(could be full url or just name if using reverse func)
        self.url = reverse("change_password") #just enter url name (field found in name= part of url)
        
        #specific test instructions
        #login
        self.client.login(username="django_lover6969", password="django_be_like")
        #send post request to server to change password
        response = self.client.post(self.url, {
            "old_password": "django_be_like",   
            "password": "new_secure_password"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Password changed successfully")

    def test_logout(self):
        self.url = reverse("logout_user") #just enter url name (field found in name= part of url)

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.login(username="django_lover6969", password="django_be_like")
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Logout Successful")
