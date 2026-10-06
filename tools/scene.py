"""Eliana Capital: bespoke Nairobi dawn scene for the home hero (blue skyline, green land).
Returns the hero scene markup: stacked layers that css/v14.css + js/v14.js move at different speeds."""
import random

def _rng(seed):
    r = random.Random(seed)
    return r

def _towers(seed, x0, x1, base, hmin, hmax, wmin, wmax, fill, clear=None, gap=(0, 6), k=.3):
    """Row of flat-topped towers between x0 and x1. `clear` = (a, b) keeps the centre open for the headline and phone."""
    r = _rng(seed); x = x0; out = []
    while x < x1:
        w = r.randint(wmin, wmax)
        h = r.randint(hmin, hmax)
        if clear and clear[0] < x + w and x < clear[1]:
            h = int(h * k)
        top = base - h
        kind = r.random()
        if kind < .22:      # stepped top
            out.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h+4}"/><rect x="{x+w*.18:.0f}" y="{top-18}" width="{w*.64:.0f}" height="20"/>')
        elif kind < .34:    # slanted roof
            out.append(f'<path d="M{x} {base+4}V{top+16}L{x+w} {top}V{base+4}Z"/>')
        elif kind < .42:    # mast
            out.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h+4}"/><rect x="{x+w/2-1.5:.0f}" y="{top-34}" width="3" height="36"/>')
        else:
            out.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h+4}"/>')
        x += w + r.randint(*gap)
    return ''.join(out)

def _windows(seed, x0, x1, base, hmax, color, n, op):
    r = _rng(seed); out = []
    for _ in range(n):
        x = r.randint(x0, x1); y = base - r.randint(18, hmax)
        out.append(f'<rect x="{x}" y="{y}" width="{r.choice((3,4,5))}" height="{r.choice((4,5,6))}" rx="1"/>')
    return f'<g fill="{color}" opacity="{op}">' + ''.join(out) + '</g>'

def _acacia(x, y, s, fill):
    """Flat-topped acacia: slim trunk, layered umbrella crown."""
    return (f'<g transform="translate({x} {y}) scale({s})" fill="{fill}">'
            '<path d="M-3 0 C-3 -40 -6 -70 -22 -100 L-14 -102 C-6 -86 0 -76 2 -62 C6 -80 14 -92 26 -104 L33 -99 C16 -84 8 -64 6 -40 C6 -20 6 -8 8 0Z"/>'
            '<ellipse cx="0" cy="-122" rx="104" ry="17"/><ellipse cx="-44" cy="-110" rx="62" ry="13"/><ellipse cx="52" cy="-112" rx="58" ry="12"/>'
            '<ellipse cx="6" cy="-136" rx="66" ry="11"/></g>')

def _leaf(x, y, rot, s, fill, cls=''):
    return (f'<g class="fol {cls}" transform="translate({x} {y}) rotate({rot}) scale({s})"><path fill="{fill}" '
            'd="M0 0 C 30 -52, 120 -92, 250 -70 C 214 -34, 130 12, 0 0Z"/>'
            '<path d="M6 -2 C 70 -28, 140 -50, 236 -66" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2.4" stroke-linecap="round"/></g>')

def build():
    W, H = 1600, 900
    clear = (520, 1080)
    # ---- far haze skyline (pale blue) ----
    far = (f'<svg class="dl dl-far" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
           '<defs><linearGradient id="gFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb9e6"/><stop offset="1" stop-color="#cfe9ea"/></linearGradient></defs>'
           f'<g fill="url(#gFar)" opacity=".62">{_towers(11, -20, W+20, 706, 90, 250, 46, 96, "", clear)}</g></svg>')
    # ---- mid skyline: bright blue with landmarks (Times Tower left, KICC right) ----
    mid_base = 730
    mid_towers = _towers(23, -30, W+30, mid_base, 120, 300, 54, 108, "", clear, gap=(2, 10))
    times = (f'<g><rect x="262" y="{mid_base-440}" width="64" height="446"/><path d="M262 {mid_base-440}L326 {mid_base-440}L318 {mid_base-462}L270 {mid_base-462}Z"/>'
             f'<rect x="291" y="{mid_base-500}" width="4" height="40"/></g>')
    kicc = (f'<g><rect x="1262" y="{mid_base-330}" width="50" height="336"/>'
            f'<rect x="1272" y="{mid_base-372}" width="30" height="46"/><ellipse cx="1287" cy="{mid_base-372}" rx="31" ry="7"/>'
            f'<rect x="1285" y="{mid_base-410}" width="4" height="40"/>'
            f'<rect x="1214" y="{mid_base-210}" width="40" height="216"/></g>')
    mid = (f'<svg class="dl dl-mid" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
           '<defs><linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2557c9"/><stop offset=".72" stop-color="#4f86d6"/><stop offset="1" stop-color="#9fd0d8"/></linearGradient></defs>'
           f'<g fill="url(#gMid)">{mid_towers}{times}{kicc}</g>'
           f'{_windows(5, 0, W, mid_base, 300, "#dff4ff", 160, ".30")}</svg>')
    # ---- near skyline: deep brand blue, warm lit windows ----
    near_base = 770
    near = (f'<svg class="dl dl-near" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
            '<defs><linearGradient id="gNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05129e"/><stop offset=".8" stop-color="#1b3fb5"/><stop offset="1" stop-color="#2d6bb9"/></linearGradient></defs>'
            f'<g fill="url(#gNear)">{_towers(37, -30, W+30, near_base, 70, 210, 60, 120, "", (500, 1100), gap=(4, 16))}</g>'
            f'{_windows(9, 0, W, near_base, 210, "#ffe7a1", 70, ".85")}</svg>')
    # ---- green land: three hills, acacias, grass ----
    land = (f'<svg class="dl dl-land" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
            '<defs><linearGradient id="gH1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad28a"/><stop offset="1" stop-color="#6db562"/></linearGradient>'
            '<linearGradient id="gH2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fa052"/><stop offset="1" stop-color="#3f8a46"/></linearGradient>'
            '<linearGradient id="gH3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7a3d"/><stop offset="1" stop-color="#1a5a34"/></linearGradient></defs>'
            f'<path fill="url(#gH1)" d="M0 770 C 220 730, 420 752, 640 760 S 1080 726, 1280 748 S 1500 744, 1600 730 V900 H0Z"/>'
            f'{_acacia(1390, 752, .6, "#2f7a3d")}{_acacia(180, 762, .5, "#3f8a46")}'
            f'<path fill="url(#gH2)" d="M0 812 C 200 786, 420 800, 700 808 S 1180 782, 1380 796 S 1540 790, 1600 780 V900 H0Z"/>'
            f'{_acacia(120, 812, .9, "#1f5c34")}{_acacia(1470, 800, 1.05, "#1f5c34")}'
            f'<path fill="url(#gH3)" d="M0 858 C 260 836, 520 850, 800 856 S 1260 836, 1600 846 V900 H0Z"/></svg>')
    # ---- foreground foliage framing both sides (swaying) ----
    fol = (f'<svg class="dl dl-fol" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
           + _leaf(-30, 920, -78, 1.05, "#2a7a3e", "a") + _leaf(-20, 930, -58, 1.15, "#4a9a4c", "b") + _leaf(-40, 910, -98, .9, "#1d5f37", "c")
           + _leaf(-10, 940, -38, .95, "#7bbb6c", "d")
           + _leaf(1630, 920, 258, 1.05, "#2a7a3e", "a") + _leaf(1620, 930, 238, 1.15, "#4a9a4c", "b") + _leaf(1640, 910, 278, .9, "#1d5f37", "c")
           + _leaf(1610, 940, 218, .95, "#7bbb6c", "d") + '</svg>')
    sky = ('<div class="dl dl-sky"></div>'
           '<div class="dl dl-sun"><i class="sun-glow"></i><i class="sun-rays"></i><i class="sun-disc"></i></div>'
           '<svg class="dl dl-cloud" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">'
           '<g fill="#fff" opacity=".7"><ellipse class="c1" cx="300" cy="150" rx="170" ry="22"/><ellipse class="c1" cx="420" cy="132" rx="110" ry="18"/>'
           '<ellipse class="c2" cx="1180" cy="110" rx="200" ry="24"/><ellipse class="c2" cx="1300" cy="94" rx="120" ry="16"/>'
           '<ellipse class="c3" cx="820" cy="210" rx="140" ry="14" opacity=".6"/></g></svg>')
    return sky + far + mid + near + land + fol

if __name__ == '__main__':
    print(len(build()))
