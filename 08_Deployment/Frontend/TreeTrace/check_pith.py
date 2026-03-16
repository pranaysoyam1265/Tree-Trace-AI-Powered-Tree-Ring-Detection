from PIL import Image, ImageDraw
import sys

img_path = r"01_Raw_Data/URuDendro/images/F02a.png"
pith_cx = 140
pith_cy = 129
out_path = "pith_check_F02a.png"

try:
    img = Image.open(img_path)
    w, h = img.size
    print(f"Original Image Size: {w}x{h}")
    
    # Draw a prominent red dot at the pith coordinate
    draw = ImageDraw.Draw(img)
    r = 20
    draw.ellipse((pith_cx - r, pith_cy - r, pith_cx + r, pith_cy + r), fill="red")
    
    # also draw the center of the image just to see where it is
    center_x, center_y = w // 2, h // 2
    draw.ellipse((center_x - r, center_y - r, center_x + r, center_y + r), fill="blue")
    
    img.save(out_path)
    print(f"Saved visualization to {out_path}. Red dot = pith coords, Blue dot = image center.")
    
except Exception as e:
    print(f"Error: {e}")
