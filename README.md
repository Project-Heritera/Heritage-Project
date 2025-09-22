# Heritage-Project

### Recommnded project layout according to gpt
```
myproject/
│
├── backend/                  # Django backend
│   ├── manage.py
│   ├── requirements.txt      # backend dependencies
│   ├── Dockerfile            # optional, if containerizing
│   ├── myproject/            # main Django project
│   │   ├── settings/
│   │   │   ├── base.py       # common settings
│   │   │   ├── dev.py        # dev settings (SQLite)
│   │   │   ├── prod.py       # prod settings (SQL Server)
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── __init__.py
│   │
│   ├── apps/                 # custom Django apps
│   │   ├── users/
│   │   ├── api/
│   │   └── ...
│   │
│   ├── static/
│   └── media/
│
├── frontend/                 # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/         # API calls to Django REST API
│   │   ├── App.js
│   │   └── index.js
│   └── public/
│
├── docs/                     # documentation
│   └── api_endpoints.md
│
├── .env                      # environment variables (NEVER commit prod secrets)
├── .gitignore
└── README.md
```
