from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from apps.website.models import Course, Section, Room
from rest_framework import status


class RoomEditorAPITestCase(APITestCase):
	def setUp(self):
		# create an admin user and a normal user
		self.admin = User.objects.create_superuser(username='admin_test', email='admin@test.com', password='adminpass')
		self.client = APIClient()
		# Use force_authenticate so DRF's IsAuthenticated passes regardless of auth backend
		self.client.force_authenticate(user=self.admin)

		# create a course and section to attach the room to
		self.course = Course.objects.create(title='Test Course', description='desc', creator=self.admin)
		self.section = Section.objects.create(course=self.course, title='Section A', description='desc', creator=self.admin)

	def test_create_and_get_room(self):
		# create a room via API
		url = f"/website/courses/{self.course.id}/sections/{self.section.id}/create_room/"
		payload = {"title": "My Test Room", "description": "Room for testing"}
		response = self.client.post(url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		room_id = response.data.get('room_id')
		self.assertIsNotNone(room_id)

		# retrieve the room
		url_get = f"/website/courses/{self.course.id}/sections/{self.section.id}/rooms/{room_id}/"
		response_get = self.client.get(url_get)
		self.assertEqual(response_get.status_code, status.HTTP_200_OK)
		# basic assertions about returned fields
		data = response_get.data
		self.assertEqual(data.get('title'), 'My Test Room')
		self.assertEqual(data.get('description'), 'Room for testing')

