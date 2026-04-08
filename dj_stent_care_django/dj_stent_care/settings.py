"""
Django Settings for DJ Stent Care Backend
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dj-stent-care-secret-key-2026-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'dj_stent_care.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'dj_stent_care.wsgi.application'

# =====================================================
# DATABASE - MySQL (same as PHP backend)
# Change DB_HOST, DB_USER, DB_PASS if needed
# =====================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'dj_stent_care',
        'USER': 'root',
        'PASSWORD': '',          # Default XAMPP / MySQL has no password
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# =====================================================
# CORS - Allow all origins for Android app
# =====================================================
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-requested-with',
    'access-control-allow-headers',
]

# =====================================================
# REST FRAMEWORK - No default auth (handled manually)
# =====================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_TZ = False

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =====================================================
# EMAIL CONFIGURATION (Gmail SMTP)
# HOW TO SET UP:
#   1. Go to myaccount.google.com → Security → 2-Step Verification → ON
#   2. Then go to: myaccount.google.com/apppasswords
#   3. Create an App Password for "Mail"
#   4. Replace EMAIL_HOST_USER and EMAIL_HOST_PASSWORD below
# =====================================================
EMAIL_BACKEND    = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST       = 'smtp.gmail.com'
EMAIL_PORT       = 587
EMAIL_USE_TLS    = True
EMAIL_HOST_USER  = 'karjunm338@gmail.com'        # <-- Change to your Gmail
EMAIL_HOST_PASSWORD = 'bruxavwinwxjjbcx'   # <-- Change to Gmail App Password
DEFAULT_FROM_EMAIL = 'DJ Stent Care <karjunm338@gmail.com>'

# Set to True to skip real email and only use debug_otp in response
EMAIL_DEBUG_MODE = False  # Real email is now active
