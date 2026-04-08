"""
Chat Views
Mirrors: api/chat/messages.php
"""

import json
from datetime import datetime
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from api.models import User, Message
from api.utils import send_success, send_error, get_auth_user


@method_decorator(csrf_exempt, name='dispatch')
class MessagesView(View):
    """GET/POST /api/chat/messages/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        partner_id = request.GET.get('user_id')
        if not partner_id:
            return send_error('User ID required')

        partner_id = int(partner_id)
        limit = int(request.GET.get('limit', 50))

        messages_qs = Message.objects.filter(
            Q(sender_id=user.id, receiver_id=partner_id) |
            Q(sender_id=partner_id, receiver_id=user.id)
        ).select_related('sender').order_by('-sent_at')[:limit]

        messages_data = []
        for m in messages_qs:
            messages_data.append({
                'id': m.id,
                'sender_id': m.sender_id,
                'receiver_id': m.receiver_id,
                'message': m.message,
                'is_read': m.is_read,
                'sent_at': str(m.sent_at),
                'sender_name': m.sender.full_name,
            })

        # Mark messages from partner as read
        Message.objects.filter(
            sender_id=partner_id, receiver_id=user.id, is_read=0
        ).update(is_read=1)

        # Get partner info
        try:
            partner = User.objects.get(id=partner_id)
            partner_data = {
                'id': partner.id,
                'full_name': partner.full_name,
                'role': partner.role,
                'profile_image': partner.profile_image,
            }
        except User.DoesNotExist:
            partner_data = None

        return send_success('Messages loaded', {
            'messages': list(reversed(messages_data)),
            'partner': partner_data,
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        if not data.get('receiver_id') or not data.get('message'):
            return send_error('Missing required fields: receiver_id, message')

        receiver_id = int(data['receiver_id'])
        message_text = data['message'].strip()

        if not message_text:
            return send_error('Message cannot be empty')

        if not User.objects.filter(id=receiver_id).exists():
            return send_error('Receiver not found')

        msg = Message(
            sender=user,
            receiver_id=receiver_id,
            message=message_text,
        )
        msg.save()

        return send_success('Message sent', {
            'id': msg.id,
            'sent_at': str(msg.sent_at),
        })
