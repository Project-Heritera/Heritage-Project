# Vivan - learn Louisianan Creole (and more!) in the modern day

This is a web app that is originally bespoke-made for learning Louisianan Creole (Kouri-Vini), an endangered language in Louisiana, and has been expanded for other courses as well. Users can learn from a predefined set of courses, while also being able to customize and create courses of their own, and share it to the wider Vivan community.

## About our Team

We are a team of LSU Computer Science undergraduate students, and are establishing this app as a project credit for CSC 4330 - Software Systems Development under Dr. Felipe Fronchetti (@fronchetti).

- William Morales (@WilliamMorales1)
- Hudson Vũ (@hudzum)
- Khánh Giang "Gerald" Lê (@g34rmeister)
- Clayton Houser (@claytakiler)
- Mujtaba Malik (@m-malik622)

## Website Features

- Learning platform - users can learn and gain knowledge at their own pace with interactive elements.
- Creating courses - users can create courses as they see fit, through a "Room Editor", by adding task components (question, text, blank, media).
- Privacy levels for courses available (public/private) - ensures courses are only public if they are meant to, and kept private while drafting or internal usage.
- Collaboration - enables users to group up and create courses together, akin to pair programming.
- Robust database - ensures all user data are contained within the platform securely.
- Profanity filtering - ensures that we don't have any obscene or offensive content.
- Optional 2 Factor Authentification - can be easily set up in user settings for extra security.
- User streaks - encourages continuous and consistent learning.
- Badges - users can show off their progress to others.

## How to run

After installing this repository, within a Terminal, navigate to the project location and run these lines of codes to initiate the frontend:

```bash
cd frontend\heritage-project-frontend\
npm install
npm run dev
```

Open up another Terminal, navigate to the project location and run these lines of codes to initiate the backend:

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

After that, log in with username: testuser | password: heritera and explore our platform at your own pace! You can start learning or creating courses at this point.

## Tech Stack and APIs

We utilized React, Tailwind and ShadCN to create our frontend, while backend is handled by Django.

Link to backend API documentations:
http://127.0.0.1:8000/api/docs/

## Acknowledgements

The information for Louisiana Creole was gathered from the following sources:
[Chinbo](https://www.chinbo.org/en/aprenn/)
[Ti Liv Kréyòl](https://sites.google.com/view/learnlouisianacreole/)
[C.R.E.O.L.E. Inc.](https://www.creoleinc.net/learncreole)
[Webonary creole dictionary](https://www.webonary.org/louisiana-creole/)
[Valdman Louisiana Creole Dictionary](https://archive.org/details/dictionaryofloui0000unse)

##
