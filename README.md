# Heritage-Project

### Recommnded project layout according to gpt
```
myproject/
│
├── backend/                  # Django backend
│   ├── manage.py
│   ├── requirements.txt      # backend dependencies
│   ├── Dockerfile            # optional, if containerizing 
│   ├── heritage_project_backend/  # main Django project
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── __init__.py
│   │
│   └── apps/                 # custom Django apps
│       ├── accoutns/          #used for user auth like login, signup, sign out, etc..
│       ├── website/            #contains database 
│       └── ...
│ 
│
├── frontend/                 
│   └── heritage-project-frontend       # React frontend
│       ├── node_modules/           #folder of all react app installations 
│       ├── package.json            #configs for react proj
│       ├── .env                    #contains env vars for base url used in prod and test 
│       ├── .gitignore               
│       └── src/
|           ├── assets/         #put images, videos, etc.. used in rendering pages
|           ├── components/     #react comopnenets
|           ├── stores/         #stores for zustald (global states)           
|           ├── pages/          
|           ├── services/       # API calls to Django REST API
|           ├── App.jsx          #main react component
|           │── App.css         #global css file
|           └── utils/
│               └─── node_modules/           #js helper functions for components
│
├── docs/                     # documentation
│   └── api_endpoints.md
│
├── .env                      # environment variables (NEVER commit prod secrets)
├── .gitignore
└── README.md                   # you are here
```
