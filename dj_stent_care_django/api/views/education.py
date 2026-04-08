"""
Education Views
Mirrors: api/education.php
"""

from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from api.models import EducationContent
from api.utils import send_success, send_error


@method_decorator(csrf_exempt, name='dispatch')
class EducationView(View):
    """GET /api/education/ - No auth required"""

    def get(self, request):
        content_type = request.GET.get('type', '').strip()
        search = request.GET.get('search', '').strip()

        qs = EducationContent.objects.filter(is_active=1)

        if content_type in ('video', 'article', 'faq'):
            qs = qs.filter(content_type=content_type)

        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        content = []
        for item in qs.order_by('id'):
            content.append({
                'id': item.id,
                'title': item.title,
                'description': item.description,
                'content_type': item.content_type,
                'content_url': item.content_url,
                'content_body': item.content_body,
                'read_time': item.read_time,
            })

        return send_success('Education content loaded', {'content': content})
