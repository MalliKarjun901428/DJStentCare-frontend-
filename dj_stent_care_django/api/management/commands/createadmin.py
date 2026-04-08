"""
Django management command to create or reset admin user.

Usage:
  python manage.py createadmin
  python manage.py createadmin --email admin@stentcare.com --password admin123
"""
from django.core.management.base import BaseCommand
from api.models import User
from api.utils import hash_password


class Command(BaseCommand):
    help = 'Create or reset the admin user for DJ Stent Care'

    def add_arguments(self, parser):
        parser.add_argument('--email', default='admin@stentcare.com',
                            help='Admin email address')
        parser.add_argument('--password', default='admin123',
                            help='Admin password')
        parser.add_argument('--name', default='System Admin',
                            help='Admin full name')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        name = options['name']

        hashed = hash_password(password)

        user, created = User.objects.update_or_create(
            email=email,
            defaults={
                'role': 'admin',
                'password': hashed,
                'full_name': name,
                'is_verified': 1,
                'is_approved': 1,
                'otp_code': None,
                'otp_expiry': None,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'[OK] Admin CREATED: email={email}, password={password}'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'[OK] Admin UPDATED: email={email}, password={password}'
            ))
        self.stdout.write(f'   Admin ID: {user.id}')
