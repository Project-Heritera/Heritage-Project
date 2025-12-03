from rest_framework import serializers
from .models import Entry, Variant, Source, Definition, POS


# -----------------------------
#  Sources
# -----------------------------
class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ["text"]


# -----------------------------
#  Variants + variant sources
# -----------------------------
class VariantSerializer(serializers.ModelSerializer):
    sources = serializers.SerializerMethodField()

    class Meta:
        model = Variant
        fields = ["text", "sources"]

    def get_sources(self, obj):
        return [s.text for s in obj.sources.all() if s.text]


# -----------------------------
#  Definitions
# -----------------------------
class DefinitionSerializer(serializers.ModelSerializer):
    def_number = serializers.IntegerField()

    class Meta:
        model = Definition
        fields = ["def_number", "gloss", "examples"]


# -----------------------------
#  Parts of Speech
# -----------------------------
class POSSerializer(serializers.ModelSerializer):
    class Meta:
        model = POS
        fields = ["part_of_speech"]


# -----------------------------
#  Entry serializer (top-level)
# -----------------------------
class EntrySerializer(serializers.ModelSerializer):
    definitions = DefinitionSerializer(many=True, read_only=True)
    variants = VariantSerializer(many=True, read_only=True)
    parts_of_speech = POSSerializer(many=True, read_only=True)

    # entry-level sources
    sources = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = [
            "headword",
            "definitions",
            "variants",
            "parts_of_speech",
            "sources",
        ]

    def get_sources(self, obj):
        # Only sources tied directly to the entry (variant_id must be null)
        return [
            s.text for s in obj.sources.all()
            if s.text and not s.variant_id
        ]
