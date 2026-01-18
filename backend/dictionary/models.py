from auditlog.registry import auditlog
from django.db import models
from simple_history.models import HistoricalRecords
from heritage_project_backend.models import IPAddressHistoricalModel


class Entry(models.Model):
    headword = models.CharField(max_length=255)
    history = HistoricalRecords(bases=[IPAddressHistoricalModel])

    class Meta:
        managed = False  # table already exists; Django should not manage it
        db_table = "dictionary_entries"
        ordering = ["headword"]

    def __str__(self):
        return self.headword


class Variant(models.Model):
    entry = models.ForeignKey(
        Entry, on_delete=models.CASCADE, related_name="variants"
    )
    text = models.TextField()
    history = HistoricalRecords(bases=[IPAddressHistoricalModel])

    class Meta:
        managed = False
        db_table = "variants"

    def __str__(self):
        return f"{self.entry.headword} ({self.text})"


class Source(models.Model):
    entry = models.ForeignKey(
        Entry, on_delete=models.CASCADE, related_name="sources"
    )
    variant = models.ForeignKey(
        Variant,
        on_delete=models.CASCADE,
        related_name="sources",
        null=True,
        blank=True,
    )
    text = models.TextField()
    history = HistoricalRecords(bases=[IPAddressHistoricalModel])

    class Meta:
        managed = False
        db_table = "sources"

    def __str__(self):
        if self.variant_id:
            return f"{self.variant.text} ({self.text})"
        return f"{self.entry.headword} ({self.text})"


class Definition(models.Model):
    entry = models.ForeignKey(
        Entry, on_delete=models.CASCADE, related_name="definitions"
    )
    def_number = models.PositiveIntegerField()
    gloss = models.TextField()
    examples = models.TextField(blank=True, null=True)
    history = HistoricalRecords(bases=[IPAddressHistoricalModel])

    class Meta:
        managed = False
        db_table = "definitions"

    def __str__(self):
        return f"{self.entry.headword} ({self.def_number})"


class POS(models.Model):
    entry = models.ForeignKey(
        Entry, on_delete=models.CASCADE, related_name="parts_of_speech"
    )
    part_of_speech = models.TextField()
    history = HistoricalRecords(bases=[IPAddressHistoricalModel])

    class Meta:
        managed = False
        db_table = "entry_parts_of_speech"

    def __str__(self):
        return f"{self.entry.headword} ({self.part_of_speech})"


# Auditlog registrations
auditlog.register(Entry)
auditlog.register(Source)
auditlog.register(Definition)
auditlog.register(Variant)
auditlog.register(POS)
