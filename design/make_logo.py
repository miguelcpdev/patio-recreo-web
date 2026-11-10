"""Genera el logo de El Patio de mi Recreo (SVG con texto convertido a trazados).

Uso:  python design/make_logo.py      (requiere fonttools y cairosvg)
Salida: client/public/images/logo*.svg, logo.png y client/public/favicon.*
Concepto: una rayuela (hopscotch) de 4 casillas de colores -> juego, patio, recreo.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import cairosvg

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "client" / "public"
IMG = OUT / "images"
FONT = "/usr/share/fonts/truetype/ubuntu/Ubuntu[wdth,wght].ttf"

INK, CORAL, SUN, MINT, VIOLET = "#14213d", "#ff5a5f", "#ffc233", "#2ec4b6", "#6c5ce7"

font = instancer.instantiateVariableFont(TTFont(FONT), {"wght": 800, "wdth": 100})
upm = font["head"].unitsPerEm
gs = font.getGlyphSet()
cmap = font.getBestCmap()
cap_h = font["OS/2"].sCapHeight


def text_width(text, size, tracking=0.0):
    return sum(font["hmtx"][cmap[ord(c)]][0] * size / upm + tracking * size for c in text)


def text_path(text, size, x, y, tracking=0.0):
    """Devuelve el atributo d de un <path> con el texto convertido a curvas."""
    pen = SVGPathPen(gs)
    cx = x
    s = size / upm
    for ch in text:
        name = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, cx, y))
        gs[name].draw(tp)
        cx += font["hmtx"][name][0] * s + tracking * size
    return pen.getCommands()


# ---- Marca: rayuela de 4 casillas -------------------------------------------------
CELL, GAP, R = 44, 8, 11
SQUARES = [  # (x, y, color, dígito, color dígito, giro)
    (26, 0, VIOLET, "4", "#fff", 5),
    (0, 52, SUN, "2", INK, -6),
    (52, 52, MINT, "3", "#fff", 5),
    (26, 104, CORAL, "1", "#fff", -4),
]
MARK_W, MARK_H = 96, 148


def mark_group():
    parts = []
    for x, y, color, digit, dcolor, rot in SQUARES:
        cx, cy = x + CELL / 2, y + CELL / 2
        size = 27
        dw = text_width(digit, size)
        d = text_path(digit, size, cx - dw / 2, cy + cap_h * size / upm / 2)
        parts.append(
            f'<g transform="rotate({rot} {cx} {cy})">'
            f'<rect x="{x}" y="{y}" width="{CELL}" height="{CELL}" rx="{R}" fill="{color}"/>'
            f'<rect x="{x+3}" y="{y+3}" width="{CELL-6}" height="{CELL-6}" rx="{R-3}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>'
            f'<path d="{d}" fill="{dcolor}"/></g>'
        )
    # chispas decorativas
    parts.append(f'<circle cx="92" cy="8" r="5" fill="{SUN}"/>')
    parts.append(f'<circle cx="4" cy="12" r="3" fill="{MINT}"/>')
    parts.append(f'<circle cx="93" cy="132" r="3.5" fill="{CORAL}"/>')
    return "".join(parts)


# ---- Logo horizontal --------------------------------------------------------------
def full_logo(text_color, tag_color):
    pad = 10
    mx, my = pad, pad
    tx = mx + MARK_W + 30
    big, small = 86, 23
    base1 = my + 92
    w_big = text_width("El Patio", big, -0.01)
    tag = "DE MI RECREO"
    w_tag = text_width(tag, small, 0.28)
    # ajusta el tracking para que la etiqueta ocupe el ancho del título
    tracking = 0.28 + (w_big - w_tag) / (small * (len(tag) - 1))
    base2 = base1 + 44
    width = tx + w_big + pad
    height = MARK_H + pad * 2
    d1 = text_path("El Patio", big, tx, base1, -0.01)
    d2 = text_path(tag, small, tx, base2, tracking)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height}" width="{width:.0f}" height="{height}" role="img" aria-label="El Patio de mi Recreo">'
        f'<title>El Patio de mi Recreo</title>'
        f'<g transform="translate({mx} {my})">{mark_group()}</g>'
        f'<path d="{d1}" fill="{text_color}"/>'
        f'<path d="{d2}" fill="{tag_color}"/>'
        f"</svg>"
    )


def mark_icon(plate=INK, size=128):
    s = 0.62
    ox = (size - MARK_W * s) / 2
    oy = (size - MARK_H * s) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}" role="img" aria-label="El Patio de mi Recreo">'
        f'<rect width="{size}" height="{size}" rx="28" fill="{plate}"/>'
        f'<g transform="translate({ox:.1f} {oy:.1f}) scale({s})">{mark_group()}</g></svg>'
    )


if __name__ == "__main__":
    IMG.mkdir(parents=True, exist_ok=True)
    (IMG / "logo.svg").write_text(full_logo(INK, CORAL), encoding="utf-8")
    (IMG / "logo-light.svg").write_text(full_logo("#ffffff", SUN), encoding="utf-8")
    (IMG / "logo-mark.svg").write_text(mark_icon(), encoding="utf-8")
    (OUT / "favicon.svg").write_text(mark_icon(), encoding="utf-8")

    cairosvg.svg2png(url=str(IMG / "logo.svg"), write_to=str(IMG / "logo.png"), output_width=1000)
    cairosvg.svg2png(url=str(IMG / "logo-light.svg"), write_to="/tmp/logo-light-preview.png", output_width=1000, background_color=INK)
    cairosvg.svg2png(url=str(OUT / "favicon.svg"), write_to=str(OUT / "favicon.png"), output_width=128)
    cairosvg.svg2png(url=str(OUT / "favicon.svg"), write_to=str(OUT / "apple-touch-icon.png"), output_width=180)
    print("logos generados")
