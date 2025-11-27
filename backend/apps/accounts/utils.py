from PIL import Image, ImageDraw, ImageFont
import os
import hashlib
from django.conf import settings

def generate_avatar(username, size=400, font_size=200):
    """
    Generate an avatar with:
    - First letter of username
    - Color based on username hash
    - Perfect centering using anchor 'mm'
    """
    # Fallback username
    text = (username[0] if username else "?").upper()

    # Generate a consistent color from username
    hash_digest = hashlib.md5(username.encode("utf-8")).hexdigest()
    # Use first 6 hex digits as RGB
    r = int(hash_digest[0:2], 16)
    g = int(hash_digest[2:4], 16)
    b = int(hash_digest[4:6], 16)
    bg_color = (r, g, b)

    # Create image
    img = Image.new("RGB", (size, size), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Load font
    try:
        font_path = os.path.join(settings.BASE_DIR, "static", "fonts", "arial.ttf")
        font = ImageFont.truetype(font_path, font_size)
    except Exception:
        font = ImageFont.load_default()

    # Draw text centered with anchor 'mm'
    draw.text(
        (size/2, size/2),
        text,
        fill="white",
        font=font,
        anchor="mm"
    )

    # Save to media
    rel_dir = "default_avatars"
    filename = f"{username}.png"
    file_path = os.path.join(settings.MEDIA_ROOT, rel_dir, filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    img.save(file_path)

    return os.path.join(rel_dir, filename)