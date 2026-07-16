import struct, io, os, sys
from PIL import Image

def to_square(img, fit_on_white=False):
    img = img.convert('RGBA')
    w, h = img.size
    side = max(w, h)
    canvas = Image.new('RGBA', (side, side), (255, 255, 255, 255))
    if fit_on_white:
        scale = min(side / w, side / h)
        nw, nh = int(round(w * scale)), int(round(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas.paste(resized, ((side - nw) // 2, (side - nh) // 2), resized)
        return canvas
    crop = min(w, h)
    sx, sy = (w - crop) // 2, (h - crop) // 2
    return img.crop((sx, sy, sx + crop, sy + crop)).resize((side, side), Image.Resampling.LANCZOS)

def png_bytes(im):
    buf = io.BytesIO()
    im.save(buf, format='PNG')
    return buf.getvalue()

def write_ico(path, images):
    count = len(images)
    header = struct.pack('<HHH', 0, 1, count)
    offset = 6 + 16 * count
    entries = []
    data = b''
    for size, blob in images:
        w = 0 if size >= 256 else size
        entries.append(struct.pack('<BBBBHHII', w, w, 0, 0, 1, 32, len(blob), offset))
        offset += len(blob)
        data += blob
    with open(path, 'wb') as f:
        f.write(header); f.write(b''.join(entries)); f.write(data)

def make_ico(png_path, ico_path, fit_on_white=False):
    square = to_square(Image.open(png_path), fit_on_white)
    sizes = [16, 32, 48, 256]
    images = [(s, png_bytes(square.resize((s, s), Image.Resampling.LANCZOS))) for s in sizes]
    write_ico(ico_path, images)
    print('Wrote', ico_path, os.path.getsize(ico_path), 'bytes')

if __name__ == '__main__':
    root = os.path.dirname(os.path.abspath(__file__))
    icons = os.path.join(root, 'icons')
    make_ico(os.path.join(icons, 'app-music.png'), os.path.join(icons, 'app-music.ico'), False)
    make_ico(os.path.join(icons, 'fabric-hl.png'), os.path.join(icons, 'fabric-hl.ico'), True)
