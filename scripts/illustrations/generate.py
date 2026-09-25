"""Generate PunterStat landing illustrations as static SVGs.

All numbers shown in the art are computed here (implied probability,
overround, Poisson goals, simulated bankrolls) so the visuals are
mathematically honest.

Usage (from the repo root, Python 3, no dependencies):
    python3 scripts/illustrations/generate.py artifacts/punterstat/public/illustrations
    mv artifacts/punterstat/public/illustrations/logo-mark.svg artifacts/punterstat/public/logo-mark.svg
"""
import math, random, os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

INK = "#0B1120"
PANEL = "#0F1830"
PANEL2 = "#131D38"
LINE = "rgba(255,255,255,0.12)"
LINE_SOFT = "rgba(255,255,255,0.06)"
INDIGO = "#3D2DFF"
VIOLET = "#7B70FF"
MINT = "#34D399"
AMBER = "#FBBF24"
TEXT = "#E2E8F0"
MUTED = "#8391AB"
SLATE = "#475569"
MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace"
SANS = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'DejaVu Sans', sans-serif"


def f(x):
    return f"{x:.1f}".rstrip("0").rstrip(".")


def svg(w, h, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
        f'role="img" aria-labelledby="t" fill="none">\n<title id="t">{title}</title>\n{body}\n</svg>\n'
    )


def esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def text(x, y, s, size=11, fill=MUTED, weight=500, anchor="start", family=MONO, ls=None, extra=""):
    lsp = f' letter-spacing="{ls}"' if ls is not None else ""
    return (
        f'<text x="{f(x)}" y="{f(y)}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}" text-anchor="{anchor}"{lsp}{extra}>{esc(s)}</text>'
    )


def defs_common(uid):
    return f"""<defs>
  <linearGradient id="{uid}-panel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{PANEL2}"/><stop offset="1" stop-color="{PANEL}"/>
  </linearGradient>
  <linearGradient id="{uid}-ind" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="{INDIGO}"/><stop offset="1" stop-color="{VIOLET}"/>
  </linearGradient>
  <radialGradient id="{uid}-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="{INDIGO}" stop-opacity="0.35"/><stop offset="1" stop-color="{INDIGO}" stop-opacity="0"/>
  </radialGradient>
</defs>"""


def panel(x, y, w, h, uid, r=18):
    return (
        f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" rx="{r}" fill="url(#{uid}-panel)"/>'
        f'<rect x="{f(x+0.5)}" y="{f(y+0.5)}" width="{f(w-1)}" height="{f(h-1)}" rx="{r-0.5}" stroke="{LINE}"/>'
    )


# ---------------------------------------------------------------- pitch helpers
def pitch_lines(X, Y, s, full=True, stroke=LINE):
    """Full 105x68 pitch lines. X(m), Y(m) map metres to px."""
    L = []
    L.append(f'<rect x="{f(X(0))}" y="{f(Y(0))}" width="{f(105*s)}" height="{f(68*s)}" rx="4" stroke="{stroke}" stroke-width="1.5"/>')
    L.append(f'<line x1="{f(X(52.5))}" y1="{f(Y(0))}" x2="{f(X(52.5))}" y2="{f(Y(68))}" stroke="{stroke}" stroke-width="1.5"/>')
    L.append(f'<circle cx="{f(X(52.5))}" cy="{f(Y(34))}" r="{f(9.15*s)}" stroke="{stroke}" stroke-width="1.5"/>')
    L.append(f'<circle cx="{f(X(52.5))}" cy="{f(Y(34))}" r="2" fill="{stroke}"/>')
    for side in (0, 1):
        if side == 0:
            bx, sx, spot, gx = 0, 1, 11, 0
        else:
            bx, sx, spot, gx = 105, -1, 94, 105
        # penalty box
        x0 = X(bx); x1 = X(bx + sx * 16.5)
        L.append(f'<rect x="{f(min(x0,x1))}" y="{f(Y(13.84))}" width="{f(16.5*s)}" height="{f(40.32*s)}" stroke="{stroke}" stroke-width="1.5"/>')
        x1s = X(bx + sx * 5.5)
        L.append(f'<rect x="{f(min(x0,x1s))}" y="{f(Y(24.84))}" width="{f(5.5*s)}" height="{f(18.32*s)}" stroke="{stroke}" stroke-width="1.5"/>')
        L.append(f'<circle cx="{f(X(spot))}" cy="{f(Y(34))}" r="1.8" fill="{stroke}"/>')
        # penalty arc (part outside the box)
        r = 9.15 * s
        dx = abs(X(bx + sx * 16.5) - X(spot))
        dy = math.sqrt(max(r * r - dx * dx, 0))
        ex = X(bx + sx * 16.5)
        sweep = 1 if side == 0 else 0
        L.append(f'<path d="M{f(ex)} {f(Y(34)-dy)} A{f(r)} {f(r)} 0 0 {sweep} {f(ex)} {f(Y(34)+dy)}" stroke="{stroke}" stroke-width="1.5"/>')
        # goal
        gw = 2.2 * s
        gx0 = X(gx) - gw if side == 0 else X(gx)
        L.append(f'<rect x="{f(gx0)}" y="{f(Y(30.34))}" width="{f(gw)}" height="{f(7.32*s)}" stroke="{stroke}" stroke-width="1.5"/>')
    return "\n".join(L)


def stripes(X, Y, s, n=10, uid="p"):
    out = []
    w = 105 * s / n
    for i in range(n):
        if i % 2 == 0:
            out.append(f'<rect x="{f(X(0)+i*w)}" y="{f(Y(0))}" width="{f(w)}" height="{f(68*s)}" fill="rgba(255,255,255,0.018)"/>')
    return "\n".join(out)


# ================================================================ HERO
def hero():
    W, H = 640, 580
    uid = "hero"
    s = 5.2
    ox, oy = 47, 44
    X = lambda m: ox + m * s
    Y = lambda m: oy + m * s
    b = [defs_common(uid)]
    b.append(panel(20, 16, 600, 398, uid))
    b.append(stripes(X, Y, s))
    b.append(pitch_lines(X, Y, s))

    # team A 4-3-3 in possession, attacking right
    A = {
        "GK": (6, 34), "LB": (34, 9), "LCB": (26, 25), "RCB": (26, 43), "RB": (36, 59),
        "CM1": (50, 20), "DM": (42, 34), "CM3": (52, 47),
        "LW": (76, 11), "ST": (84, 31), "RW": (78, 55),
    }
    B = [(101.5, 34), (88, 17), (91, 29), (91, 40), (87, 52), (77, 25), (76, 42), (70, 34)]
    links = [
        ("GK", "LCB", .35), ("GK", "RCB", .25), ("LCB", "RCB", .6), ("LCB", "LB", .5), ("RCB", "RB", .45),
        ("LCB", "DM", .7), ("RCB", "DM", .6), ("DM", "CM1", .8), ("DM", "CM3", .9), ("CM1", "LB", .55),
        ("CM3", "RB", .6), ("CM1", "LW", .7), ("CM1", "ST", .45), ("CM3", "ST", .5), ("LW", "ST", .4),
        ("RW", "ST", .45),
    ]
    for a, c, w in links:
        (x1, y1), (x2, y2) = A[a], A[c]
        b.append(f'<line x1="{f(X(x1))}" y1="{f(Y(y1))}" x2="{f(X(x2))}" y2="{f(Y(y2))}" stroke="rgba(160,170,255,{0.12+w*0.25:.2f})" stroke-width="{f(1+w*2.6)}" stroke-linecap="round"/>')

    # highlighted progressive chain DM -> CM3 -> RW -> shot
    chain = [A["DM"], A["CM3"], A["RW"], (95.5, 38.5)]
    d = "M" + " L".join(f"{f(X(x))} {f(Y(y))}" for x, y in chain)
    b.append(f'<defs><marker id="{uid}-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="{VIOLET}"/></marker></defs>')
    b.append(f'<path d="{d}" stroke="{VIOLET}" stroke-width="2.5" stroke-dasharray="7 6" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#{uid}-arr)"/>')

    # shot map (xG sized)
    shots = [(95.5, 38.5, 0.34, True), (89, 27, 0.07, False), (97.5, 31, 0.21, False), (84.5, 43, 0.04, False), (93, 46, 0.09, False), (99.5, 35.5, 0.48, True)]
    for x, y, xg, goal in shots:
        r = 3 + math.sqrt(xg) * 15
        if goal:
            b.append(f'<circle cx="{f(X(x))}" cy="{f(Y(y))}" r="{f(r)}" fill="{MINT}" fill-opacity="0.22" stroke="{MINT}" stroke-width="1.5"/>')
        else:
            b.append(f'<circle cx="{f(X(x))}" cy="{f(Y(y))}" r="{f(r)}" stroke="{MINT}" stroke-opacity="0.55" stroke-width="1.2" stroke-dasharray="3 3"/>')

    # team B (defending): outlined
    for x, y in B:
        b.append(f'<circle cx="{f(X(x))}" cy="{f(Y(y))}" r="6.5" fill="{INK}" stroke="{SLATE}" stroke-width="2"/>')
    # team A: filled
    for k, (x, y) in A.items():
        hi = k in ("DM", "CM3", "RW")
        b.append(f'<circle cx="{f(X(x))}" cy="{f(Y(y))}" r="{9 if hi else 7.5}" fill="{INDIGO if not hi else VIOLET}" stroke="{INK}" stroke-width="2"/>')
        if hi:
            b.append(f'<circle cx="{f(X(x))}" cy="{f(Y(y))}" r="14" stroke="{VIOLET}" stroke-opacity="0.35" stroke-width="1.5"/>')

    # xG callout for the goal
    gx, gy = X(95.5), Y(38.5)
    b.append(f'<line x1="{f(gx+10)}" y1="{f(gy+10)}" x2="{f(gx+26)}" y2="{f(gy+44)}" stroke="{MINT}" stroke-opacity="0.6"/>')
    b.append(f'<rect x="{f(gx-4)}" y="{f(gy+44)}" width="72" height="24" rx="6" fill="{INK}" stroke="{MINT}" stroke-opacity="0.5"/>')
    b.append(text(gx + 32, gy + 60, "xG 0.34", 11, MINT, 600, "middle"))

    # top-left label
    b.append(f'<rect x="40" y="30" width="182" height="0" />')
    b.append(text(44, 36, "PASS NETWORK · SHOT MAP", 10, MUTED, 600, ls="1.2"))
    # legend top-right
    lx = 470
    b.append(f'<circle cx="{lx}" cy="32" r="4.5" fill="{INDIGO}"/>' + text(lx + 9, 36, "IN POSSESSION", 9, MUTED, 600, ls="0.8"))

    # ---- card 1: implied probability
    cx, cy, cw, ch = 20, 430, 290, 134
    b.append(panel(cx, cy, cw, ch, uid, 16))
    b.append(text(cx + 20, cy + 28, "IMPLIED PROBABILITY", 10, MUTED, 600, ls="1.2"))
    b.append(text(cx + 20, cy + 72, "2.10", 34, TEXT, 600))
    b.append(f'<path d="M{cx+112} {cy+60} h26 m-7 -6 l7 6 l-7 6" stroke="{MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>')
    b.append(text(cx + 150, cy + 72, "47.6%", 34, VIOLET, 600))
    bw = cw - 40
    b.append(f'<rect x="{cx+20}" y="{cy+90}" width="{bw}" height="8" rx="4" fill="rgba(255,255,255,0.07)"/>')
    b.append(f'<rect x="{cx+20}" y="{cy+90}" width="{f(bw*0.476)}" height="8" rx="4" fill="url(#{uid}-ind)"/>')
    b.append(text(cx + 20, cy + 118, "1 ÷ 2.10 = 0.476", 11, MUTED, 500))

    # ---- card 2: Poisson goals
    lam = 1.62
    P = [math.exp(-lam) * lam ** k / math.factorial(k) for k in range(6)]
    cx2, cw2 = 326, 294
    b.append(panel(cx2, cy, cw2, ch, uid, 16))
    b.append(text(cx2 + 20, cy + 28, f"GOALS · POISSON λ = {lam}", 10, MUTED, 600, ls="1.2"))
    base = cy + 106
    maxh = 58
    slot = (cw2 - 40) / 6
    pm = max(P)
    for k, p in enumerate(P):
        hgt = p / pm * maxh
        x = cx2 + 20 + k * slot + 7
        wbar = slot - 14
        fill = f"url(#{uid}-ind)" if p == pm else "rgba(123,112,255,0.35)"
        b.append(f'<rect x="{f(x)}" y="{f(base-hgt)}" width="{f(wbar)}" height="{f(hgt)}" rx="4" fill="{fill}"/>')
        b.append(text(x + wbar / 2, base + 16, str(k) if k < 5 else "5+", 10, MUTED, 500, "middle"))
        if p == pm:
            b.append(text(x + wbar / 2, base - hgt - 7, f"{p*100:.0f}%", 11, TEXT, 600, "middle"))
    return svg(W, H, "\n".join(b), "Tactical board: pass network and shot map, with implied probability and Poisson goal model cards")


# ================================================================ MODULE CARDS (480 x 300)
MW, MH = 480, 300


def module_frame(uid, label, body):
    b = [defs_common(uid), f'<clipPath id="{uid}-clip"><rect x="0.5" y="0.5" width="{MW-1}" height="{MH-1}" rx="16"/></clipPath>',
         panel(0.5, 0.5, MW - 1, MH - 1, uid, 16)]
    b.append(f'<g clip-path="url(#{uid}-clip)"><circle cx="{MW-60}" cy="30" r="190" fill="url(#{uid}-glow)" opacity="0.55"/></g>')
    b.append(text(22, 32, label, 10, MUTED, 600, ls="1.2"))
    b.append(body)
    return "\n".join(b)


def university():
    uid = "uni"
    s = 3.3
    ox, oy = (MW - 105 * s) / 2, 60
    X = lambda m: ox + m * s
    Y = lambda m: oy + m * s
    b = [stripes(X, Y, s, 10), pitch_lines(X, Y, s)]
    # 4-3-3 shape with pressing arrows
    pos = [(6, 34), (30, 10), (26, 26), (26, 42), (30, 58), (48, 20), (42, 34), (48, 48), (70, 12), (74, 34), (70, 56)]
    press = [((70, 12), (82, 20)), ((74, 34), (86, 31)), ((70, 56), (82, 48)), ((48, 20), (62, 24)), ((48, 48), (62, 44))]
    b.append(f'<defs><marker id="{uid}-a" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="{VIOLET}"/></marker></defs>')
    for (x1, y1), (x2, y2) in press:
        b.append(f'<line x1="{f(X(x1))}" y1="{f(Y(y1))}" x2="{f(X(x2))}" y2="{f(Y(y2))}" stroke="{VIOLET}" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#{uid}-a)"/>')
    # shape lines (lines of the formation)
    rows = [[(30, 10), (26, 26), (26, 42), (30, 58)], [(48, 20), (42, 34), (48, 48)], [(70, 12), (74, 34), (70, 56)]]
    for r in rows:
        d = "M" + " L".join(f"{f(X(x))} {f(Y(y))}" for x, y in r)
        b.append(f'<path d="{d}" stroke="rgba(123,112,255,0.35)" stroke-width="1.5"/>')
    for x, y in pos:
        b.append(f'<circle cx="{f(X(x))}" cy="{f(Y(y))}" r="6.5" fill="{INDIGO}" stroke="{INK}" stroke-width="2"/>')
    # tag
    b.append(f'<rect x="{MW-150}" y="18" width="128" height="24" rx="12" fill="rgba(61,45,255,0.18)" stroke="rgba(123,112,255,0.5)"/>')
    b.append(text(MW - 86, 34, "4-3-3 · HIGH PRESS", 10, TEXT, 600, "middle"))
    return svg(MW, MH, module_frame(uid, "FORMATIONS & SYSTEMS", "\n".join(b)), "4-3-3 formation with pressing movements on a pitch")


def academy():
    uid = "acad"
    b = []
    # plot implied probability vs decimal odds
    x0, y0, w, h = 58, 58, 250, 190
    omin, omax = 1.0, 6.0
    X = lambda o: x0 + (o - omin) / (omax - omin) * w
    Y = lambda p: y0 + h - p * h
    for p in (0, .25, .5, .75, 1):
        b.append(f'<line x1="{x0}" y1="{f(Y(p))}" x2="{x0+w}" y2="{f(Y(p))}" stroke="{LINE_SOFT}"/>')
        b.append(text(x0 - 8, Y(p) + 4, f"{int(p*100)}%", 9, MUTED, 500, "end"))
    for o in (1, 2, 3, 4, 5, 6):
        b.append(text(X(o), y0 + h + 16, f"{o:.0f}.0" if o < 6 else "6.0", 9, MUTED, 500, "middle"))
    b.append(text(x0 + w / 2, y0 + h + 32, "DECIMAL ODDS", 9, MUTED, 600, "middle", ls="1"))
    pts = []
    o = 1.0
    while o <= 6.0001:
        pts.append((X(o), Y(1 / o)))
        o += 0.05
    d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts)
    area = d + f" L{f(X(6))} {f(Y(0))} L{f(X(1))} {f(Y(0))} Z"
    b.append(f'<path d="{area}" fill="rgba(61,45,255,0.10)"/>')
    b.append(f'<path d="{d}" stroke="url(#{uid}-ind)" stroke-width="2.5"/>')
    px, py = X(2.10), Y(1 / 2.10)
    b.append(f'<line x1="{f(px)}" y1="{f(py)}" x2="{f(px)}" y2="{f(Y(0))}" stroke="{VIOLET}" stroke-dasharray="3 3"/>')
    b.append(f'<line x1="{x0}" y1="{f(py)}" x2="{f(px)}" y2="{f(py)}" stroke="{VIOLET}" stroke-dasharray="3 3"/>')
    b.append(f'<circle cx="{f(px)}" cy="{f(py)}" r="5.5" fill="{VIOLET}" stroke="{INK}" stroke-width="2"/>')
    b.append(f'<rect x="{f(px+10)}" y="{f(py-30)}" width="92" height="22" rx="6" fill="{INK}" stroke="rgba(123,112,255,0.5)"/>')
    b.append(text(px + 56, py - 15, "2.10 → 47.6%", 10, TEXT, 600, "middle"))

    # overround stacked bar (1X2 market)
    odds = [("H", 2.10, INDIGO), ("D", 3.50, VIOLET), ("A", 3.40, "#A5A0FF")]
    imp = [1 / o for _, o, _ in odds]
    book = sum(imp)
    bx, by, bw, bh = 340, 58, 26, 190
    scale = bh / 1.10
    yb = by + bh
    b.append(text(bx + 40, by - 8 + 0, "", 9))
    cur = yb
    for (lab, o, col), p in zip(odds, imp):
        hh = p * scale
        b.append(f'<rect x="{bx}" y="{f(cur-hh)}" width="{bw}" height="{f(hh-1.5)}" rx="3" fill="{col}"/>')
        b.append(text(bx + bw + 10, cur - hh / 2 + 4, f"{lab} {o:.2f}", 10, TEXT, 600))
        b.append(text(bx + bw + 10, cur - hh / 2 + 17, f"{p*100:.1f}%", 9, MUTED, 500))
        cur -= hh
    y100 = yb - 1.0 * scale
    b.append(f'<line x1="{bx-8}" y1="{f(y100)}" x2="{bx+bw+8}" y2="{f(y100)}" stroke="{AMBER}" stroke-width="1.5"/>')
    b.append(text(bx - 12, y100 + 4, "100%", 9, AMBER, 600, "end"))
    b.append(text(bx - 4, yb + 16, f"BOOK {book*100:.1f}%", 9, MUTED, 600))
    b.append(text(bx - 4, yb + 32, f"MARGIN {(book-1)*100:.1f}%", 9, AMBER, 600))
    return svg(MW, MH, module_frame(uid, "ODDS → PROBABILITY", "\n".join(b)), "Chart converting decimal odds to implied probability, and a 1X2 market showing the bookmaker margin"), book


def simulator():
    uid = "sim"
    rnd = random.Random(7)
    b = []
    x0, y0, w, h = 50, 54, 330, 200
    N, T = 40, 300
    # +EV bettor: stake 1 unit, odds 2.10, true p = 0.50 -> EV = +5%
    p, o = 0.50, 2.10
    paths = []
    for _ in range(N):
        v, path = 0.0, [0.0]
        for _ in range(T):
            v += (o - 1) if rnd.random() < p else -1
            path.append(v)
        paths.append(path)
    lo = min(min(pp) for pp in paths); hi = max(max(pp) for pp in paths)
    lo, hi = min(lo, -40), max(hi, 60)
    X = lambda t: x0 + t / T * w
    Y = lambda v: y0 + h - (v - lo) / (hi - lo) * h
    for v in range(int(math.ceil(lo / 20) * 20), int(hi) + 1, 20):
        b.append(f'<line x1="{x0}" y1="{f(Y(v))}" x2="{x0+w}" y2="{f(Y(v))}" stroke="{LINE_SOFT}"/>')
        b.append(text(x0 - 8, Y(v) + 3, f"{v:+d}" if v else "0", 9, MUTED, 500, "end"))
    b.append(f'<line x1="{x0}" y1="{f(Y(0))}" x2="{x0+w}" y2="{f(Y(0))}" stroke="rgba(255,255,255,0.25)"/>')
    for pp in paths:
        d = "M" + " L".join(f"{f(X(t))} {f(Y(v))}" for t, v in enumerate(pp) if t % 3 == 0 or t == T)
        col = "rgba(52,211,153,0.28)" if pp[-1] >= 0 else "rgba(148,163,184,0.25)"
        b.append(f'<path d="{d}" stroke="{col}" stroke-width="1"/>')
    ev = p * (o - 1) - (1 - p)
    d = f"M{f(X(0))} {f(Y(0))} L{f(X(T))} {f(Y(ev*T))}"
    b.append(f'<path d="{d}" stroke="url(#{uid}-ind)" stroke-width="3" stroke-linecap="round"/>')
    b.append(f'<circle cx="{f(X(T))}" cy="{f(Y(ev*T))}" r="4.5" fill="{VIOLET}" stroke="{INK}" stroke-width="2"/>')
    b.append(text(x0 + w / 2, y0 + h + 18, f"{T} BETS · STAKE 1u · ODDS {o:.2f} · TRUE p = {p:.2f}", 9, MUTED, 600, "middle", ls="0.6"))
    # final distribution histogram on the right
    finals = [pp[-1] for pp in paths]
    hx = x0 + w + 16
    bins = {}
    bs = 10
    for v in finals:
        k = math.floor(v / bs) * bs
        bins[k] = bins.get(k, 0) + 1
    mx = max(bins.values())
    for k, c in bins.items():
        yt, yb2 = Y(k + bs), Y(k)
        ln = c / mx * 60
        col = MINT if k >= 0 else SLATE
        b.append(f'<rect x="{f(hx)}" y="{f(yt+1)}" width="{f(ln)}" height="{f(max(yb2-yt-2,1))}" rx="2" fill="{col}" fill-opacity="0.75"/>')
    pos = sum(1 for v in finals if v > 0)
    b.append(text(hx, y0 - 4, f"{pos}/{N} UP", 9, MINT, 600))
    b.append(f'<rect x="{MW-176}" y="18" width="154" height="24" rx="12" fill="rgba(61,45,255,0.18)" stroke="rgba(123,112,255,0.5)"/>')
    b.append(text(MW - 99, 34, f"EXPECTED VALUE {ev*100:+.1f}%", 10, TEXT, 600, "middle"))
    return svg(MW, MH, module_frame(uid, f"MONTE CARLO · {N} SEASONS", "\n".join(b)), "Simulated profit paths for a positive expected value strategy, showing variance around the expected line"), (ev, pos, N)


def match():
    uid = "match"
    b = []
    x0, y0, w, h = 50, 60, 390, 180
    # cumulative xG timelines
    home = [(8, .06), (17, .31), (23, .04), (34, .12), (41, .45), (52, .08), (58, .22), (66, .05), (71, .38), (79, .11), (86, .09)]
    away = [(12, .03), (27, .18), (38, .07), (49, .52), (61, .04), (74, .13), (83, .06), (89, .21)]
    goals_home = {41, 71}
    goals_away = {49}
    tot_h = sum(x for _, x in home); tot_a = sum(x for _, x in away)
    ymax = 2.4
    X = lambda m: x0 + m / 90 * w
    Y = lambda v: y0 + h - v / ymax * h
    for v in (0, .5, 1, 1.5, 2):
        b.append(f'<line x1="{x0}" y1="{f(Y(v))}" x2="{x0+w}" y2="{f(Y(v))}" stroke="{LINE_SOFT}"/>')
        b.append(text(x0 - 8, Y(v) + 3, f"{v:.1f}", 9, MUTED, 500, "end"))
    for m in (0, 15, 30, 45, 60, 75, 90):
        b.append(text(X(m), y0 + h + 16, f"{m}'", 9, MUTED, 500, "middle"))
    b.append(f'<line x1="{f(X(45))}" y1="{y0}" x2="{f(X(45))}" y2="{y0+h}" stroke="rgba(255,255,255,0.12)" stroke-dasharray="3 4"/>')
    b.append(text(X(45) + 5, y0 + 10, "HT", 9, MUTED, 600))

    def step(ev, col, goals, width):
        v = 0.0
        d = f"M{f(X(0))} {f(Y(0))}"
        marks = []
        for m, x in ev:
            d += f" L{f(X(m))} {f(Y(v))}"
            v += x
            d += f" L{f(X(m))} {f(Y(v))}"
            if m in goals:
                marks.append((X(m), Y(v)))
        d += f" L{f(X(90))} {f(Y(v))}"
        b.append(f'<path d="{d}" stroke="{col}" stroke-width="{width}" stroke-linejoin="round"/>')
        for x, y in marks:
            b.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="6" fill="{MINT}" stroke="{INK}" stroke-width="2"/>')
        return v

    step(away, "#94A3B8", goals_away, 2)
    step(home, VIOLET, goals_home, 2.8)
    # legend / scoreline
    b.append(f'<rect x="{MW-196}" y="18" width="174" height="24" rx="12" fill="rgba(61,45,255,0.18)" stroke="rgba(123,112,255,0.5)"/>')
    b.append(text(MW - 109, 34, f"xG {tot_h:.2f} – {tot_a:.2f} · FT 2–1", 10, TEXT, 600, "middle"))
    ly = y0 + h + 36
    b.append(f'<line x1="{x0}" y1="{ly-4}" x2="{x0+18}" y2="{ly-4}" stroke="{VIOLET}" stroke-width="2.8"/>' + text(x0 + 24, ly, "HOME", 9, MUTED, 600))
    b.append(f'<line x1="{x0+80}" y1="{ly-4}" x2="{x0+98}" y2="{ly-4}" stroke="#94A3B8" stroke-width="2"/>' + text(x0 + 104, ly, "AWAY", 9, MUTED, 600))
    b.append(f'<circle cx="{x0+166}" cy="{ly-4}" r="4.5" fill="{MINT}"/>' + text(x0 + 176, ly, "GOAL", 9, MUTED, 600))
    return svg(MW, MH, module_frame(uid, "xG FLOW · MATCH TIMELINE", "\n".join(b)), "Cumulative expected goals timeline for both teams with goals marked"), (tot_h, tot_a)


# ================================================================ PITCH PATTERN (background)
def pattern():
    W, H = 1200, 780
    s = 11
    ox, oy = (W - 105 * s) / 2, (H - 68 * s) / 2
    X = lambda m: ox + m * s
    Y = lambda m: oy + m * s
    body = pitch_lines(X, Y, s, stroke="rgba(255,255,255,0.07)")
    return svg(W, H, body, "Pitch line pattern")


# ================================================================ LOGO MARK
def logo():
    # Two half-discs split along a diagonal, recreated from the original logo.png
    W = H = 64
    ang = math.radians(-70)  # direction of the split line
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux  # normal
    r = 17
    b = [f'<rect width="64" height="64" rx="14" fill="{INDIGO}"/>']
    for cx, cy, sgn in ((26.5, 38.5, -1), (37.5, 25.5, 1)):
        ax, ay = cx - ux * r, cy - uy * r
        bx, by = cx + ux * r, cy + uy * r
        sweep = 0 if sgn > 0 else 1
        b.append(f'<path d="M{f(ax)} {f(ay)} A{r} {r} 0 0 {sweep} {f(bx)} {f(by)} Z" fill="#fff"/>')
    return svg(W, H, "\n".join(b), "PunterStat")


open(os.path.join(OUT, "hero-pitch.svg"), "w").write(hero())
u = university(); open(os.path.join(OUT, "module-university.svg"), "w").write(u)
a, book = academy(); open(os.path.join(OUT, "module-academy.svg"), "w").write(a)
sm, simstats = simulator(); open(os.path.join(OUT, "module-simulator.svg"), "w").write(sm)
m, xg = match(); open(os.path.join(OUT, "module-match.svg"), "w").write(m)
open(os.path.join(OUT, "pitch-pattern.svg"), "w").write(pattern())
open(os.path.join(OUT, "logo-mark.svg"), "w").write(logo())
print("book", book, "sim", simstats, "xg", xg)
