import unicodedata
import re
from thefuzz import fuzz

# --- 1. Global Cache and Constants ---

# Global cache: { 'normalized_word': 'Original Word with Accents' }
NORMALIZED_HEADWORDS_CACHE = {} 

# --- 3. Cache Management Function ---

def build_headword_cache():
    """
    Fetches all headwords from the database, normalizes them, 
    and stores them in the in-memory global cache.
    """
    # Import models here to avoid circular imports during startup
    from .models import Entry 
    
    try:
        # Fetch all entries, only selecting the headword field
        all_entries = Entry.objects.all().values_list('headword', flat=True)
        
        # Clear cache before rebuilding
        NORMALIZED_HEADWORDS_CACHE.clear()
        
        for headword in all_entries:
            norm_word = headword.lower()
            # Store the original headword as the value, so we can return it to the user
            NORMALIZED_HEADWORDS_CACHE[norm_word] = headword
        
        print(f"[Dictionary Util] Cache built successfully with {len(NORMALIZED_HEADWORDS_CACHE)} entries.")
        
    except Exception as e:
        # This can fail if the database isn't migrated yet during initial setup
        print(f"[Dictionary Util] WARNING: Could not build headword cache. Error: {e}")


# --- 4. Fuzzy Search Function ---

def find_closest_match(term):
    """
    Searches the cached normalized headwords for the closest match 
    to the user's input 'term' using thefuzz (Levenshtein distance).
    
    Returns: The original (un-normalized) headword string if score >= THRESHOLD, 
             otherwise None.
    """
    build_headword_cache()

    best_score = 0
    closest_match_key = None

    # Iterate over the normalized keys in the cache
    for normalized_key in NORMALIZED_HEADWORDS_CACHE.keys():
        # token_sort_ratio is robust to different word ordering/spacing, 
        # which is useful if your aggressive_normalize didn't remove spaces.
        # Since we removed spaces, ratio() or partial_ratio() might also work well.
        score = fuzz.token_sort_ratio(term, normalized_key)
        
        if score > best_score:
            best_score = score
            closest_match_key = normalized_key

    # Check if the best score meets your quality bar
    if closest_match_key:
        return NORMALIZED_HEADWORDS_CACHE[closest_match_key]
    
    return None

# --- 5. Match Whole Words Function ---

def strip_accents(text):
    """
    Strips accents from a string without removing punctuation or changing case 
    (used when match_accents is False).
    """
    nfkd_form = unicodedata.normalize('NFKD', text)
    # Filter out combining characters (accents)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])


def whole_word_match(text, search, match_accents):
    """
    Return True if `text` contains a word that exactly equals `search`,
    respecting `match_accents` toggle.
    """
    if not text or not search:
        return False

    # 1. Normalization based on the 'match_accents' toggle
    if match_accents:
        # Keep original text (just lowercase for case-insensitivity)
        text_to_search = text.lower()
        search_text = search.lower()
    else:
        text_to_search = strip_accents(text).lower()
        search_text = strip_accents(search).lower()

    # 2. Match as whole words using regex
    try:
        # re.escape handles special characters in the search term (like '.', '?', etc.)
        # \b ensures we match the beginning and end of a word boundary.
        # re.UNICODE ensures \b works correctly with Unicode characters.
        pattern = fr"\b{re.escape(search_text)}\b"
        return bool(re.search(pattern, text_to_search, flags=re.UNICODE))
    except re.error:
        # Catches potential issues if search_text resulted in an invalid regex pattern
        return False