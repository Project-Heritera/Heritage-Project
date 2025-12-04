from better_profanity import profanity

# Make the censor method replace with XXXX instead of ****
def censor_with_xxxx(text):
    return profanity.censor(text, censor_char="X")