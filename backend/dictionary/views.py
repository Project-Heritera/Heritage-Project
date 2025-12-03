from django.db.models import Q, Prefetch
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import unicodedata
import re

from .serializers import EntrySerializer, POSSerializer, SourceSerializer
from .models import Entry, Variant, Source, POS

# --- Utility Functions ---
def normalize_text(text):
    """Normalize text to NFD (decomposed) form."""
    return unicodedata.normalize('NFD', text or '')

def strip_accents(text):
    """Remove all accent marks from the text."""
    text = normalize_text(text)
    return ''.join(c for c in text if unicodedata.category(c) != 'Mn')

def whole_word_match(text, search, match_accents):
    """
    Return True if `text` contains a word that exactly equals `search`,
    respecting `match_accents` toggle, using the same logic as the highlight filter.
    """
    if not text or not search:
        return False

    # Normalize text and search if we ignore accents
    if not match_accents:
        # Create normalized (accent-stripped) text and map back to original
        normalized_chars = []
        for ch in text:
            nfd = unicodedata.normalize('NFD', ch)
            for c in nfd:
                if unicodedata.category(c) != 'Mn':
                    normalized_chars.append(c)
        text_to_search = ''.join(normalized_chars)
        search_text = strip_accents(search)
    else:
        text_to_search = text
        search_text = search

    # Case-insensitive match
    text_to_search = text_to_search.lower()
    search_text = search_text.lower()

    # Match as whole words using regex
    try:
        pattern = fr"\b{re.escape(search_text)}\b"
        return bool(re.search(pattern, text_to_search, flags=re.UNICODE))
    except re.error:
        return False


@extend_schema(
    tags=["Dictionary"],
    summary="Search dictionary for a word",
    description="Searches the dictionary with relevant filters and options.",
    parameters=[
        OpenApiParameter("q", str, OpenApiParameter.QUERY, description="Search query"),
        OpenApiParameter("search_definitions", bool, OpenApiParameter.QUERY),
        OpenApiParameter("whole_word", bool, OpenApiParameter.QUERY),
        OpenApiParameter("match_accents", bool, OpenApiParameter.QUERY),
        OpenApiParameter("search_examples", bool, OpenApiParameter.QUERY),
        OpenApiParameter(
            name="part_of_speech",
            type=str,
            location=OpenApiParameter.QUERY,
            description="Filter by part of speech",
            enum=[
                "BT", "CA", "DT", "DT 77", "LA", "MO", "MO 50", "MO 60",
                "MO 69", "MO 72", "NE", "PC", "ST", "TN", "gen"
            ],
        ),
        OpenApiParameter(
            name="source",
            type=str,
            location=OpenApiParameter.QUERY,
            enum=[
                "adj.", "adv.", "adv.phr.", "art.def.", "art.indef.", "conj.", "dem.",
                "det.", "det.poss.", "int.", "interr.phr.", "n.", "n.phr.",
                "num.card.", "num.ord.", "onom.", "place n.", "prep.",
                "pron.", "pron.indef.", "pron.refl.", "pron.rel.", "prop.n.",
                "ptcl.", "v.", "v.aux.", "v.cop.", "v.intr.", "v.mod.",
                "v.phr.", "v.refl.", "v.tr."
            ],
        )
    ],
    responses={
        200: inline_serializer(
            name="SearchDictRequest",
            fields={
                'query': serializers.CharField(),
                'search_definitions': serializers.BooleanField(), # headword ~ Creole, definitions ~ English/French
                'whole_word': serializers.BooleanField(),
                'match_accents': serializers.BooleanField(),
                'search_examples': serializers.BooleanField(),
                'selected_pos': serializers.ChoiceField(
                    choices=[
                        "BT","CA","DT","DT 77","LA","MO","MO 50","MO 60","MO 69",
                        "MO 72","NE","PC","ST","TN","gen"
                    ],
                    allow_blank=True
                ),
                'selected_source': serializers.ChoiceField(
                    choices=[
                        "adj.","adv.","adv.phr.","art.def.","art.indef.","conj.","dem.",
                        "det.","det.poss.","int.","interr.phr.","n.","n.phr.",
                        "num.card.","num.ord.","onom.","place n.","prep.",
                        "pron.","pron.indef.","pron.refl.","pron.rel.","prop.n.",
                        "ptcl.","v.","v.aux.","v.cop.","v.intr.","v.mod.","v.phr.",
                        "v.refl.","v.tr."
                    ],
                    allow_blank=True
                ),
                'result_count': serializers.IntegerField(),
                'results': EntrySerializer(many=True)
            }
        )
    }
)
@api_view(["GET"])
def search_dict(request):
    query = request.GET.get('q', '').strip()
    search_definitions = 'search_definitions' in request.GET
    whole_word = 'whole_word' in request.GET
    match_accents = 'match_accents' in request.GET
    search_examples = 'search_examples' in request.GET
    selected_pos = request.GET.get('part_of_speech', '')
    selected_source = request.GET.get('source', '')

    display_query = query
    search_query = strip_accents(query) if not match_accents else query

    # Prefetch related objects to avoid N+1 queries
    variants_prefetch = Prefetch('variants', queryset=Variant.objects.prefetch_related('sources'))
    results = Entry.objects.all().prefetch_related(
        'definitions', 'parts_of_speech', 'sources', variants_prefetch
    ).distinct()

    # --- Apply search query ---
    if search_query:
        search_norm = search_query.lower() if match_accents else strip_accents(search_query).lower()
        filtered = []

        for entry in results:
            definitions_match = False
            head_matches = False
            variant_matches = False

            # --- Definitions search ---
            if search_definitions == True:
                for definition in entry.definitions.all():
                    gloss = definition.gloss or ''
                    examples = definition.examples or ''
                    text_to_search = f"{gloss} {examples}" if search_examples else gloss

                    if whole_word:
                        if whole_word_match(text_to_search, query, match_accents):
                            definitions_match = True
                            break
                    else:
                        text_norm = text_to_search if match_accents else strip_accents(text_to_search)
                        if search_norm in text_norm.lower():
                            definitions_match = True
                            break
            else:
                # --- Headword match ---
                head = entry.headword or ''
                if whole_word:
                    head_matches = whole_word_match(head, query, match_accents)
                else:
                    head_norm = head if match_accents else strip_accents(head)
                    head_matches = search_norm in head_norm.lower()

                # --- Variant match ---
                if whole_word:
                    variant_matches = any(whole_word_match(v.text or '', query, match_accents) for v in entry.variants.all())
                else:
                    variant_matches = any(search_norm in (v.text if match_accents else strip_accents(v.text)).lower() for v in entry.variants.all())

            # --- POS filter ---
            pos_matches = True
            if selected_pos:
                pos_matches = any(p.part_of_speech == selected_pos for p in entry.parts_of_speech.all())

            # --- Source filter ---
            source_matches = True
            if selected_source:
                entry_sources = [s.text.strip() for s in entry.sources.all() if s.text]
                variant_sources = [s.text.strip() for v in entry.variants.all() for s in v.sources.all() if s.text]
                source_matches = selected_source in entry_sources or selected_source in variant_sources

            # --- Include entry if it passes filters ---
            if (definitions_match or head_matches or variant_matches) and pos_matches and source_matches:
                filtered.append(entry)
        
        # --- Apply POS & Source filters for remaining results ---
        if selected_pos:
            results = results.filter(parts_of_speech__part_of_speech=selected_pos)
        if selected_source:
            results = results.filter(
                Q(sources__text=selected_source) |
                Q(variants__sources__text=selected_source)
            ).distinct()

        results = filtered

    # --- Prepare sources for display ---
    processed_results = []
    for entry in results:
        # --- Entry-level sources only ---
        entry_sources = [
            s.text.strip() 
            for s in entry.sources.all() 
            if s.text and s.text.strip() and s.variant_id is None
        ]
        entry.sources_display = ', '.join(entry_sources) if entry_sources else "No sources"

        variants_list = []
        for variant in entry.variants.all():
            variant_sources = [s.text.strip() for s in variant.sources.all() if s.text]
            variant.sources_display = ', '.join(variant_sources) if variant_sources else "No sources"
            variants_list.append(variant)

        entry.variants_display = variants_list
        processed_results.append(entry)

    processed_results.sort(key=lambda e: (e.headword or "").lower())

    data = {
        'query': display_query,
        'search_definitions': search_definitions,
        'whole_word': whole_word,
        'match_accents': match_accents,
        'search_examples': search_examples,
        'selected_pos': selected_pos,
        'selected_source': selected_source,
        'result_count': len(processed_results),
        'results': processed_results,
    }

    data['results'] = EntrySerializer(processed_results, many=True).data

    return Response(data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Dictionary"],
    summary="Get all POS for dropdown.",
    description="Get all unique the POS options for the dropdown. Does not filter out based on the current query.",
    responses={
        200: POSSerializer(many=True)
    }
)
@api_view(["GET"])
def get_all_pos(request):
    all_pos = POS.objects.exclude(part_of_speech__isnull=True) \
                   .exclude(part_of_speech="") \
                   .values_list("part_of_speech", flat=True) \
                   .distinct() \
                   .order_by("part_of_speech") \

    return Response(all_pos, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Dictionary"],
    summary="Get all sources for dropdown.",
    description="Get all the unique sources options for the dropdown. Does not filter out based on the current query.",
    responses={
        200: SourceSerializer(many=True)
    }
)
@api_view(["GET"])
def get_all_sources(request):
    all_sources = Source.objects.exclude(text__isnull=True) \
                   .exclude(text="") \
                   .values_list("text", flat=True) \
                   .distinct() \
                   .order_by("text")

    return Response(all_sources, status=status.HTTP_200_OK)