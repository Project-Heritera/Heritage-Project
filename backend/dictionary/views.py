import re
from django.db.models import Q, Prefetch, Case, When, Value, IntegerField
from drf_spectacular.utils import (
    extend_schema_view,
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    inline_serializer,
)
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from thefuzz import fuzz
from .utils import find_closest_match, strip_accents, whole_word_match
from .serializers import EntrySerializer, POSSerializer, SourceSerializer
from .models import Definition, Entry, Variant, Source, POS


@extend_schema(
    tags=["Dictionary"],
    summary="Get all POS for dropdown.",
    description="Get all unique the POS options for the dropdown. Does not filter out based on the current query.",
    responses={200: POSSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_pos(request):
    all_pos = (
        POS.objects.exclude(part_of_speech__isnull=True)
        .exclude(part_of_speech="")
        .values_list("part_of_speech", flat=True)
        .distinct()
        .order_by("part_of_speech")
    )
    return Response(all_pos, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Dictionary"],
    summary="Get all sources for dropdown.",
    description="Get all the unique sources options for the dropdown. Does not filter out based on the current query.",
    responses={200: SourceSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_sources(request):
    all_sources = (
        Source.objects.exclude(text__isnull=True)
        .exclude(text="")
        .values_list("text", flat=True)
        .distinct()
        .order_by("text")
    )

    return Response(all_sources, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Dictionary"],
    summary="Get all headwords.",
    description="Get only the headwords of all entries in the database.",
    responses={
        200: inline_serializer(
            name="GetHeadwordsResponse",
            fields={"headwords": serializers.ListField(child=serializers.CharField())},
        ),
        404: OpenApiResponse(description="Could not get headwords."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_n_to_m_headwords(request, n, m):
    if n > m or m > Entry.objects.count() or n < 0:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    entries = Entry.objects.all()[n:m]
    serializer = EntrySerializer(entries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


def get_vowel_regex(term):
    # Map base vowels to their possible accented versions
    vowel_map = {
        "a": "[aàáâãäå]",
        "e": "[eèéêëœ]",
        "i": "[iìíîï]",
        "o": "[oòóôõöøœ]",
        "u": "[uùúûü]",
        "y": "[yýÿ]",
        "n": "[nñ]",
        "c": "[cç]",
    }

    # 1. Strip existing accents and lowercase to get the "base" string
    base_term = strip_accents(term).lower()

    # 2. Build the regex pattern
    pattern = ""
    for char in base_term:
        pattern += vowel_map.get(char, re.escape(char))

    # Use ^ and $ to ensure we match the whole word, not just parts of it
    return f"^{pattern}$"


@extend_schema(
    tags=["Dictionary"],
    summary="Get term data.",
    description="Get the variants, definitions, sources and POS of a term. It will return first any exact match of the headword followed by any entries with variants that match the term (ignoring accents and case). Also returns a closest match if entry is not found. The closest match is based on Levenshtein distance. Important note: It may and often will return multiple entries because they share the same headword, unfortunately these cannot be combined in the DB because they have different variants and etymologies, and so aren't the same word (compare English 'check~cheque' (for money) vs. 'check' (to verify)).",
    responses={
        200: EntrySerializer(many=True),
        404: OpenApiResponse(
            description="Could not find term 'term'. Did you mean 'closest match'?"
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_term_data(request, term):
    norm_term = strip_accents(term).lower()
    regex_pattern = get_vowel_regex(term)

    entries = (
        Entry.objects.filter(
            Q(headword=term)
            | Q(headword__iregex=regex_pattern)
            | Q(variants__text__iregex=regex_pattern)
        )
        .annotate(
            # Create a temporary priority field: 1 for exact match, 2 for others
            priority=Case(
                When(headword=term, then=Value(1)),
                default=Value(2),
                output_field=IntegerField(),
            )
        )
        .order_by("priority", "headword")
        .distinct()
    )
    top_50_enteris = entries[:50]

    if entries.exists():
        serializer = EntrySerializer(top_50_enteris, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        # Find the headword string of the closest match
        closest_match_headword = find_closest_match(term)
        if closest_match_headword:
            # Fetch the full Entry object(s) for the closest match
            suggested_entries = Entry.objects.filter(headword=closest_match_headword)
            serializer = EntrySerializer(suggested_entries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Dictionary"],
    summary="Get term exact data.",
    description="Get the variants, definitions, sources and POS of a term. Only will return terms that exactly match (accents, case, etc.).",
    responses={
        200: EntrySerializer(many=True),
        404: OpenApiResponse(
            description="Could not find term 'term'. Did you mean 'closest match'?"
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_term_exact_data(request, term):
    entries = Entry.objects.filter(headword=term)

    if entries.exists():
        serializer = EntrySerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    else:
        closest_match = find_closest_match(term)
        return Response(
            {
                "message": f"Could not find the term '{term}'. Did you mean '{closest_match}'?"
            },
            status=status.HTTP_404_NOT_FOUND,
        )


@extend_schema(
    tags=["Dictionary"],
    summary="Search within definitions.",
    description="Search for a term within the 'gloss' of all definitions using a regular expression. The search is case-insensitive and accent-insensitive. If no entries are found, it suggests entries for the closest matching headword. Returns up to 50 matching entries.",
    responses={
        200: EntrySerializer(many=True),
        404: OpenApiResponse(
            description="Could not find any definitions matching 'term'. Did you mean entries for 'closest_match'?"
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_definition_data(request, term):
    # Build a regex pattern for case-insensitive and accent-insensitive search
    regex_pattern = get_vowel_regex(term)

    # Find entries that have a definition with a gloss matching the regex
    entries = (
        Entry.objects.filter(definitions__gloss__iregex=regex_pattern)
        .order_by("headword")
        .distinct()
    )

    # Limit to the top 50 results
    top_50_entries = entries[:50]

    if entries.exists():
        serializer = EntrySerializer(top_50_entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        # Fallback: Find the top 50 definitions with the closest matching gloss
        matches = []
        # Fetch only the necessary fields to optimize memory usage
        all_definitions = Definition.objects.values("gloss", "entry_id")

        for definition in all_definitions.iterator():
            # token_set_ratio is good for finding a phrase within a larger text block
            score = fuzz.token_set_ratio(term, definition["gloss"])
            # A threshold of 60 is a decent starting point to avoid irrelevant results
            if score > 60:
                matches.append({"score": score, "entry_id": definition["entry_id"]})

        if matches:
            # Sort by score descending, then by entry_id to have a stable sort
            matches.sort(key=lambda x: (x["score"], x["entry_id"]), reverse=True)

            # Get unique entry IDs while preserving order of first appearance
            seen_ids = set()
            unique_ordered_ids = []
            for match in matches:
                if match["entry_id"] not in seen_ids:
                    seen_ids.add(match["entry_id"])
                    unique_ordered_ids.append(match["entry_id"])

            # Limit to the top 50 unique entries
            top_50_ids = unique_ordered_ids[:50]

            # Preserve the sort order from the fuzzy match in the final queryset
            preserved_order = Case(
                *[When(pk=pk, then=pos) for pos, pk in enumerate(top_50_ids)]
            )
            suggested_entries = Entry.objects.filter(pk__in=top_50_ids).order_by(
                preserved_order
            )

            serializer = EntrySerializer(suggested_entries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If no match is found at all, return an empty list with a 404.
        return Response([], status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=["Dictionary"],
    summary="Get n terms",
    description="Get terms starting at cursor and up to the limit. For example, ?cursor=bon&limit=50 will return bon + the next 49 words.",
    parameters=[
        OpenApiParameter("cursor", str, OpenApiParameter.QUERY),
        OpenApiParameter("limit", int, OpenApiParameter.QUERY),
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
                "BT",
                "CA",
                "DT",
                "DT 77",
                "LA",
                "MO",
                "MO 50",
                "MO 60",
                "MO 69",
                "MO 72",
                "NE",
                "PC",
                "ST",
                "TN",
                "gen",
            ],
        ),
        OpenApiParameter(
            name="source",
            type=str,
            location=OpenApiParameter.QUERY,
            enum=[
                "adj.",
                "adv.",
                "adv.phr.",
                "art.def.",
                "art.indef.",
                "conj.",
                "dem.",
                "det.",
                "det.poss.",
                "int.",
                "interr.phr.",
                "n.",
                "n.phr.",
                "num.card.",
                "num.ord.",
                "onom.",
                "place n.",
                "prep.",
                "pron.",
                "pron.indef.",
                "pron.refl.",
                "pron.rel.",
                "prop.n.",
                "ptcl.",
                "v.",
                "v.aux.",
                "v.cop.",
                "v.intr.",
                "v.mod.",
                "v.phr.",
                "v.refl.",
                "v.tr.",
            ],
        ),
    ],
    responses={
        200: inline_serializer(
            name="SearchDictRequest",
            fields={
                "cursor": serializers.CharField(),
                "limit": serializers.IntegerField(),
                "query": serializers.CharField(),
                "search_definitions": serializers.BooleanField(),  # headword ~ Creole, definitions ~ English/French
                "whole_word": serializers.BooleanField(),
                "match_accents": serializers.BooleanField(),
                "search_examples": serializers.BooleanField(),
                "selected_pos": serializers.ChoiceField(
                    choices=[
                        "BT",
                        "CA",
                        "DT",
                        "DT 77",
                        "LA",
                        "MO",
                        "MO 50",
                        "MO 60",
                        "MO 69",
                        "MO 72",
                        "NE",
                        "PC",
                        "ST",
                        "TN",
                        "gen",
                    ],
                    allow_blank=True,
                ),
                "selected_source": serializers.ChoiceField(
                    choices=[
                        "adj.",
                        "adv.",
                        "adv.phr.",
                        "art.def.",
                        "art.indef.",
                        "conj.",
                        "dem.",
                        "det.",
                        "det.poss.",
                        "int.",
                        "interr.phr.",
                        "n.",
                        "n.phr.",
                        "num.card.",
                        "num.ord.",
                        "onom.",
                        "place n.",
                        "prep.",
                        "pron.",
                        "pron.indef.",
                        "pron.refl.",
                        "pron.rel.",
                        "prop.n.",
                        "ptcl.",
                        "v.",
                        "v.aux.",
                        "v.cop.",
                        "v.intr.",
                        "v.mod.",
                        "v.phr.",
                        "v.refl.",
                        "v.tr.",
                    ],
                    allow_blank=True,
                ),
                "result_count": serializers.IntegerField(),
                "results": EntrySerializer(many=True),
            },
        ),
        404: OpenApiResponse(description="No terms found with given parameters."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_n_terms(request):
    cursor = request.GET.get("cursor", "").strip()
    limit = int(request.GET.get("limit", ""))
    query = request.GET.get("q", "").strip()
    search_definitions = "search_definitions" in request.GET
    whole_word = "whole_word" in request.GET
    match_accents = "match_accents" in request.GET
    search_examples = "search_examples" in request.GET
    selected_pos = request.GET.get("part_of_speech", "")
    selected_source = request.GET.get("source", "")

    display_query = query
    search_query = strip_accents(query) if not match_accents else query

    # Prefetch related objects to avoid N+1 queries
    variants_prefetch = Prefetch(
        "variants", queryset=Variant.objects.prefetch_related("sources")
    )
    results = (
        Entry.objects.all()
        .prefetch_related(
            "definitions", "parts_of_speech", "sources", variants_prefetch
        )
        .distinct()
    )

    # --- Apply search query ---
    if search_query:
        search_norm = (
            search_query.lower()
            if match_accents
            else strip_accents(search_query).lower()
        )
        filtered = []

        for entry in results:
            definitions_match = False
            head_matches = False
            variant_matches = False

            # --- Definitions search ---
            if search_definitions == True:
                for definition in entry.definitions.all():
                    gloss = definition.gloss or ""
                    examples = definition.examples or ""
                    text_to_search = f"{gloss} {examples}" if search_examples else gloss

                    if whole_word:
                        if whole_word_match(text_to_search, query, match_accents):
                            definitions_match = True
                            break
                    else:
                        text_norm = (
                            text_to_search
                            if match_accents
                            else strip_accents(text_to_search)
                        )
                        if search_norm in text_norm.lower():
                            definitions_match = True
                            break
            else:
                # --- Headword match ---
                head = entry.headword or ""
                if whole_word:
                    head_matches = whole_word_match(head, query, match_accents)
                else:
                    head_norm = head if match_accents else strip_accents(head)
                    head_matches = search_norm in head_norm.lower()

                # --- Variant match ---
                if whole_word:
                    variant_matches = any(
                        whole_word_match(v.text or "", query, match_accents)
                        for v in entry.variants.all()
                    )
                else:
                    variant_matches = any(
                        search_norm
                        in (v.text if match_accents else strip_accents(v.text)).lower()
                        for v in entry.variants.all()
                    )

            # --- POS filter ---
            pos_matches = True
            if selected_pos:
                pos_matches = any(
                    p.part_of_speech == selected_pos
                    for p in entry.parts_of_speech.all()
                )

            # --- Source filter ---
            source_matches = True
            if selected_source:
                entry_sources = [s.text.strip() for s in entry.sources.all() if s.text]
                variant_sources = [
                    s.text.strip()
                    for v in entry.variants.all()
                    for s in v.sources.all()
                    if s.text
                ]
                source_matches = (
                    selected_source in entry_sources
                    or selected_source in variant_sources
                )

            # --- Include entry if it passes filters ---
            if (
                (definitions_match or head_matches or variant_matches)
                and pos_matches
                and source_matches
            ):
                filtered.append(entry)

        # --- Apply POS & Source filters for remaining results ---
        if selected_pos:
            results = results.filter(parts_of_speech__part_of_speech=selected_pos)
        if selected_source:
            results = results.filter(
                Q(sources__text=selected_source)
                | Q(variants__sources__text=selected_source)
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
        entry.sources_display = (
            ", ".join(entry_sources) if entry_sources else "No sources"
        )

        variants_list = []
        for variant in entry.variants.all():
            variant_sources = [s.text.strip() for s in variant.sources.all() if s.text]
            variant.sources_display = (
                ", ".join(variant_sources) if variant_sources else "No sources"
            )
            variants_list.append(variant)

        entry.variants_display = variants_list
        processed_results.append(entry)

    processed_results.sort(key=lambda e: (e.headword or "").lower())

    # 1. Determine the start index based on the 'cursor' string
    try:
        # This assumes 'cursor' matches an entry's headword or unique identifier
        start_index = next(
            i for i, e in enumerate(processed_results) if e.headword == cursor
        )
    except (ValueError, StopIteration):
        # Fallback to the beginning if the cursor is not found
        start_index = 0

    # 2. Slice from start_index up to the limit
    # Note: start_index + limit is the exclusive stop index
    limited_results = processed_results[start_index : start_index + limit]

    data = {
        "query": display_query,
        "search_definitions": search_definitions,
        "whole_word": whole_word,
        "match_accents": match_accents,
        "search_examples": search_examples,
        "selected_pos": selected_pos,
        "selected_source": selected_source,
        "result_count": len(limited_results),
        "results": limited_results,
    }

    data["results"] = EntrySerializer(limited_results, many=True).data

    if not data["results"]:
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    return Response(data, status=status.HTTP_200_OK)
