import os
from PIL import Image, ImageDraw, ImageFont

# The ASCII Logo text
ascii_logo = """
 ████████╗████████╗
 ╚══██╔══╝╚══██╔══╝
    ██║      ██║
    ██║      ██║
    ██║      ██║
    ╚═╝      ╚═╝
"""

# Colors
bg_color = (10, 10, 10, 0) # Transparent background
text_color = (234, 88, 12, 255) # #ea580c

def generate_logo():
    # Try to load a nice monospace font (Consolas is standard on Windows)
    try:
        font = ImageFont.truetype("consola.ttf", 40)
    except IOError:
        try:
            # Fallback to Courier New
            font = ImageFont.truetype("cour.ttf", 40)
        except IOError:
            # Fallback to default
            print("Warning: could not load consolas or courier, using default font.")
            font = ImageFont.load_default()

    # Calculate text size to create an image of the right dimensions
    # ImageDraw.textbbox is available in newer Pillow versions
    # We will use textbbox to get size
    dummy_img = Image.new("RGBA", (1, 1), bg_color)
    draw = ImageDraw.Draw(dummy_img)
    
    lines = ascii_logo.strip("\n").split("\n")
    
    # We find height per line and max width
    max_width = 0
    total_height = 0
    
    # Simple bounding box approximation
    try:
        bbox = draw.multiline_textbbox((0, 0), ascii_logo.strip("\n"), font=font)
        max_width = bbox[2] - bbox[0]
        total_height = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older PIL versions
        max_width, total_height = draw.textsize(ascii_logo.strip("\n"), font=font)
    
    # Add padding
    padding = 20
    img_width = max_width + padding * 2
    img_height = total_height + padding * 2

    # Create the actual image
    img = Image.new("RGBA", (int(img_width), int(img_height)), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw the text
    draw.multiline_text((padding, padding), ascii_logo.strip("\n"), fill=text_color, font=font, spacing=4)

    # Save it to the public dir
    out_dir = r"C:\Users\prana\OneDrive\Desktop\TreeTrace\08_Deployment\Frontend\public"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "ascii-logo.png")
    
    img.save(out_path)
    print(f"ASCII logo successfully saved to: {out_path}")

if __name__ == "__main__":
    generate_logo()
