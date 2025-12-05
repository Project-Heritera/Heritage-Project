from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.signals import pre_create_historical_record
from django.dispatch import receiver
from simple_history.models import HistoricalRecords

class IPAddressHistoricalModel(models.Model):
    """
    Abstract model to add IP address to history records.
    """
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)

    class Meta:
        abstract = True

@receiver(pre_create_historical_record)
def record_history_ip_address(sender, **kwargs):
    history_instance = kwargs['history_instance']
    # The middleware puts the request object here
    request = HistoricalRecords.context.request
    
    if request:
        # Get the IP we cleaned in our custom middleware
        history_instance.ip_address = request.META.get('REMOTE_ADDR')