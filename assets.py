from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
font_candidates = [
    root / 'assets/DejaVuSans.ttf',
    Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),
    Path('C:/Windows/Fonts/arial.ttf')
]
font = next((str(p) for p in font_candidates if p.exists()), 'DejaVuSans.ttf')
atlas = Image.new('L', (1024, 2048)); draw = ImageDraw.Draw(atlas); header = []; y = 2

for name, label, size in [
    ('HOLD', 'HOLD', 22), ('NEXT', 'NEXT', 22),
    ('SCORE', 'SCORE', 22), ('LINES', 'LINES', 22), ('LEVEL', 'LEVEL', 22),
    ('EXIT', '+/-: EXIT   DOWN: SOFT DROP   Y: HARD DROP   X: HOLD', 22),
    ('GAMEOVER', 'GAME OVER', 64), ('RESTART', 'A to play again, +/- to exit', 28),
]:
    face = ImageFont.truetype(font, size); box = draw.textbbox((0, 0), label, font=face)
    w, h = box[2] - box[0], box[3] - box[1]
    draw.text((2 - box[0], y - box[1]), label, font=face, fill=255)
    header.append(f'const ivec4 TEXT_{name} = ivec4(2, {y}, {w}, {h});')
    y += h + 8

digit_face = ImageFont.truetype(font, 36)
digit_pitch = max(draw.textbbox((0, 0), d, font=digit_face)[2] for d in '0123456789') + 4
digit_rows = []
for d in range(10):
    box = draw.textbbox((0, 0), str(d), font=digit_face); w, h = box[2] - box[0], box[3] - box[1]
    draw.text((2 - box[0], y - box[1]), str(d), font=digit_face, fill=255)
    digit_rows.append(f'ivec4(2, {y}, {w}, {h})')
    y += h + 8
header.append('const ivec4 DIGITS[10] = ivec4[10](' + ', '.join(digit_rows) + ');')
header.append(f'const float DIGIT_PITCH = {digit_pitch}.0;')

(root / 'assets/text.bin').write_bytes(atlas.tobytes())
(root / 'shaders/text.glsl').write_text('\n'.join(header) + '\n')

im = Image.new('RGBA', (256, 256), (16, 18, 28, 255)); d = ImageDraw.Draw(im)
blocks = [(70, 150), (106, 150), (142, 150), (106, 114)]
for bx, by in blocks:
    d.rounded_rectangle((bx, by, bx + 32, by + 32), radius=5, fill=(130, 60, 190), outline=(230, 220, 250), width=2)
d.rectangle((40, 190, 216, 200), fill=(60, 64, 80))
im.save(root / 'assets/icon.png')
