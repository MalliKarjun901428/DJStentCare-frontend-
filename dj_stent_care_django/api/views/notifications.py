"""
Notification Views
Mirrors: api/notifications.php
"""

import json
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api.models import Notification
from api.utils import send_success, send_error, get_auth_user


@method_decorator(csrf_exempt, name='dispatch')
class NotificationsView(View):
    """GET/POST /api/notifications/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        limit = int(request.GET.get('limit', 20))
        unread_only = request.GET.get('unread_only', '').lower() == 'true'

        qs = Notification.objects.filter(user=user)
        if unread_only:
            qs = qs.filter(is_read=0)

        notifications = []
        for n in qs.order_by('-created_at')[:limit]:
            notifications.append({
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'type': n.type,
                'is_read': n.is_read,
                'created_at': str(n.created_at),
            })

        unread_count = Notification.objects.filter(user=user, is_read=0).count()

        return send_success('Notifications loaded', {
            'notifications': notifications,
            'unread_count': unread_count,
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        action = data.get('action', 'read')

        if action == 'read_all':
            Notification.objects.filter(user=user).update(is_read=1)
            return send_success('All notifications marked as read')

        elif action == 'read' and data.get('id'):
            Notification.objects.filter(id=int(data['id']), user=user).update(is_read=1)
            return send_success('Notification marked as read')

        return send_error('Invalid action')
