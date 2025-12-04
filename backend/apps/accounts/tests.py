from unittest import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from django.utils import timezone
from rest_framework import status
from django.test import TestCase
from freezegun import freeze_time

User = get_user_model()

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


    def test_valid_signin(self):
        self.url = reverse("login")
        response = self.client.post(self.url,{
            "username": "django_lover6969",
            "password": "django_be_like"
        })
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
  
    def test_invalid_signin(self):
        self.url = reverse("login")
        response = self.client.post(self.url,{
            "username": "i_love_microplastics@microplastics.com",
            "password": "django_be_like"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
  
    def invalid_signup(self):
        self.url = reverse("signup")
        #same everything
        response = self.client.post(self.url,{
            "username": "django_lover6969",
            "password": "django_be_like",
            "email": "i_love_microplastics@microplastics.com"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #existing username but diff email
        response = self.client.post(self.url,{
           "username": "django_lover6969",
            "password": "django_be_like",
            "email": "diffemail@fmil.com"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #existing email but diff usernmae
        response = self.client.post(self.url,{
                "username": "diff_username",
            "password": "django_be_like",
            "email": "i_love_microplastics@microplastics.com"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def valid_signup(self):
        self.url = reverse("signup")
        #same everything
        response = self.client.post(self.url,{
            "username": "newacc",
            "password": "newall@gmail.com",
            "email": "i_love_microplastics@microplastics.com"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_logout(self):
        self.url = reverse("logout_user") 
        self.client.login(username="django_lover6969", password="django_be_like")
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Logout Successful")


    def test_delete(self):
        self.url = reverse("delete_account") 
        self.client.login(username="django_lover6969", password="django_be_like")
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class StreakTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test",
            password="pass"
        )

    @freeze_time("2025-01-01")
    def test_streak_resets_after_missing_day(self):
        # Day 1
        self.user.update_streak()
        self.assertEqual(self.user.streak, 1)

        # Day 2 → streak increments
        with freeze_time("2025-01-02"):
            self.user.update_streak()
            self.user.refresh_from_db()
            self.assertEqual(self.user.streak, 2)

        # Day 3 → no action (missed day)

        # Day 4 → streak resets
        with freeze_time("2025-01-04"):
            self.user.update_streak()
            self.user.refresh_from_db()
            self.assertEqual(self.user.streak, 0)
