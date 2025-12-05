from better_profanity import profanity
import base64
from io import BytesIO
from PIL import Image
import openai
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

def censor_image(base64_image):
    img_data = base64.b64decode(base64_image)
    img = Image.open(BytesIO(img_data))

    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()

    response = openai.moderations.create(
        model="omni-moderation-latest",
        input=img_bytes
    )

    # Check the response categories
    results = response["results"][0]
    return results["categories"]["sexual"] == False and results["categories"]["violence"] == False