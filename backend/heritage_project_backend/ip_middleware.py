class RealIPMiddleware:
    """
    Middleware to fix request.META['REMOTE_ADDR'] based on
    X-Forwarded-For headers (for proxies/load balancers).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # The first IP in the list is usually the real client
            ip = x_forwarded_for.split(',')[0].strip()
            request.META['REMOTE_ADDR'] = ip
        return self.get_response(request)