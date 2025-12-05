from better_profanity import profanity
profanity.load_censor_words()

# Make the censor method replace with XXXX instead of ****
def censor_with_xxxx(text):
    return profanity.censor(text, censor_char="X")

def censor_json(value):
    if isinstance(value, str):
        return profanity.censor(value, censor_char="X")

    if isinstance(value, list):
        return [censor_json(v) for v in value]

    if isinstance(value, dict):
        return {k: censor_json(v) for k, v in value.items()}

    return value  # ints, bool, None, etc.