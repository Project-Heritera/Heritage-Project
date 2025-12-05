from better_profanity import profanity
import base64
from io import BytesIO
from PIL import Image
from google.cloud import vision
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

def check_image_safety_google(data_json):
    """
    Checks if a base64 image in a JSON field is safe using Google Vision SafeSearch.
    Expects: {"src": "BASE64STRING", ...}
    Returns: dict {"safe": True/False, "message": "..."}
    """
    base64_img = data_json.get("src")
    if not base64_img:
        return {"safe": False, "message": "No 'src' field provided."}

    # Convert base64 to bytes
    try:
        img_data = base64.b64decode(base64_img)
        img = Image.open(BytesIO(img_data))
    except Exception:
        return {"safe": False, "message": "Invalid base64 image."}

    try:
        client = vision.ImageAnnotatorClient()
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        content = buffered.getvalue()

        image = vision.Image(content=content)
        response = client.safe_search_detection(image=image)
        safe = response.safe_search_annotation

        # Likelihood values: 0=UNKNOWN, 1=VERY_UNLIKELY, 2=UNLIKELY, 3=LIKELY, 4=VERY_LIKELY
        unsafe = (
            safe.adult in [3, 4] or
            safe.violence in [3, 4] or
            safe.racy in [3, 4]
        )

        if unsafe:
            return {"safe": False, "message": "Image contains inappropriate content."}
        else:
            return {"safe": True, "message": "Image is safe."}

    except Exception as e:
        return {"safe": False, "message": f"Error checking image: {str(e)}"}
