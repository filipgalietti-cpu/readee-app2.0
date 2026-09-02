#!/usr/bin/env python3
"""
Finishes the Lucide -> Glyph migration on customer-facing surfaces.

The first pass of this migration only rewrote direct JSX (`<BookOpen />`) and
left every icon that travels as a *data value* (`icon: BookOpen` in a lookup
map, rendered later through `<Icon />`). That is what produced the half-swapped
dashboard. This script handles both shapes.

Internal surfaces (owner, admin, classroom, student) intentionally keep Lucide:
they are developer dashboards and Lucide is the right register for one.
"""
import os, re, sys

# Lucide name -> Glyph name in public/icons/ui
MAP = {
    "Angry": "angry", "AudioLines": "waves", "Award": "award", "BarChart3": "bar-chart3",
    "Bell": "bell", "BookOpen": "book-open", "BookOpenText": "book-open", "BookText": "book",
    "Bot": "bot", "Brain": "brain", "Bug": "bug", "Building2": "building",
    "Calendar": "calendar-days", "CalendarDays": "calendar-days", "Carrot": "carrot",
    "Check": "check", "CheckCircle": "check-circle2", "CheckCircle2": "check-circle2",
    "ChevronDown": "chevron-down", "ChevronLeft": "chevron-left", "ChevronRight": "chevron-right",
    "ChevronsUpDown": "chevrons-up-down", "Circle": "circle", "CircleHelp": "circle-help",
    "ClipboardCheck": "clipboard-check", "ClipboardList": "list-checks",
    "ClipboardPen": "clipboard-pen", "Clock": "clock", "Coins": "coins", "Compass": "compass",
    "CreditCard": "credit-card", "Crown": "crown", "Download": "download",
    "ExternalLink": "external-link", "Eye": "eye", "Factory": "factory", "Feather": "pen-line",
    "FileText": "file-text", "Flag": "flag", "Flame": "flame", "Frown": "frown",
    "Gauge": "gauge", "Globe": "globe", "GraduationCap": "graduation-cap",
    "Headphones": "headphones", "Heart": "heart", "HelpCircle": "help-circle", "Home": "home",
    "Image": "image", "ImageIcon": "image", "KeyRound": "key-round", "Layers": "layers",
    "Library": "library", "LibraryIcon": "library", "LifeBuoy": "life-buoy",
    "Lightbulb": "lightbulb", "ListChecks": "list-checks", "Loader2": "loader2", "Lock": "lock",
    "LogOut": "log-out", "Mail": "mail", "Map": "map", "Medal": "award", "Megaphone": "megaphone",
    "Meh": "meh", "Menu": "menu", "MessageCircle": "message-circle",
    "MessageSquare": "message-square", "MessageSquareText": "message-square", "Mic": "mic",
    "Newspaper": "newspaper", "Pause": "pause", "PenLine": "pen-line", "PenTool": "pen-line",
    "Pencil": "pencil", "Play": "play", "Plus": "plus", "Printer": "printer", "Puzzle": "puzzle",
    "RefreshCw": "refresh-cw", "Rocket": "rocket", "RotateCcw": "rotate-ccw",
    "RotateCw": "rotate-cw", "ScanLine": "scan", "Search": "search", "SearchIcon": "search",
    "Send": "send", "Settings": "settings", "Share": "share", "Shield": "shield",
    "ShieldCheck": "shield-check", "Shuffle": "shuffle", "SkipForward": "skip-forward",
    "Smile": "smile", "SmilePlus": "smile-plus", "Sparkles": "sparkles", "Square": "square",
    "Star": "star", "Target": "target", "ThumbsDown": "thumbs-down", "ThumbsUp": "thumbs-up",
    "Trash2": "trash2", "TrendingUp": "trending-up", "Trophy": "trophy", "Type": "text",
    "User": "user", "UserPlus": "user-plus", "Users": "users", "VolumeX": "volume-x",
    "Volume2": "volume2", "Wand2": "wand", "X": "x", "XCircle": "x-circle", "XIcon": "x",
    "Zap": "zap",
}

# Tailwind size class -> px
SZ = {"2": 8, "2.5": 10, "3": 12, "3.5": 14, "4": 16, "5": 20, "6": 24, "7": 28, "8": 32,
      "9": 36, "10": 40, "11": 44, "12": 48, "14": 56, "16": 64, "20": 80, "24": 96}

INTERNAL = ("/classroom/", "/admin/", "/(student)/", "/owner/", "/class/", "/demo/")


def size_from(tag: str):
    """px size implied by a Lucide tag's className / size prop, or None."""
    m = re.search(r'\bsize=\{(\d+)\}', tag)
    if m:
        return int(m.group(1))
    m = re.search(r'className="[^"]*\bh-([\d.]+)\b', tag) or \
        re.search(r'className="[^"]*\bw-([\d.]+)\b', tag)
    if m and m.group(1) in SZ:
        return SZ[m.group(1)]
    return None


def clean_class(tag: str) -> str:
    """className with the sizing utilities removed (Glyph sizes itself)."""
    m = re.search(r'className="([^"]*)"', tag)
    if not m:
        m2 = re.search(r'className=\{([^}]*)\}', tag)
        return "{" + m2.group(1) + "}" if m2 else ""
    kept = [c for c in m.group(1).split() if not re.fullmatch(r'[hw]-[\d.]+', c)]
    return '"' + " ".join(kept) + '"' if kept else ""


def convert(path: str) -> tuple[bool, list[str]]:
    src = open(path, encoding="utf-8").read()
    if "lucide-react" not in src:
        return False, []
    orig, notes = src, []

    imported = []
    for blk in re.findall(r'import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*"lucide-react"', src, re.S):
        for part in blk.split(","):
            part = part.strip()
            if not part:
                continue
            o, _, a = part.partition(" as ")
            imported.append((o.strip(), (a.strip() or o.strip())))

    body = re.sub(r'import\s+(?:type\s+)?\{[^}]*\}\s*from\s*"lucide-react";?\n?', "", src, flags=re.S)
    live = [(o, a) for o, a in imported if re.search(r'\b' + re.escape(a) + r'\b', body)]
    unmapped = [o for o, a in live if o not in MAP and o != "LucideIcon"]
    if unmapped:
        return False, [f"SKIP {path}: no glyph for {unmapped}"]

    # 1. direct JSX  <Name ... />  ->  <Glyph name="..." size={N} ... />
    for o, a in live:
        if o == "LucideIcon":
            continue
        g = MAP[o]

        def repl(m, g=g):
            tag = m.group(0)
            n = size_from(tag) or 20
            cls = clean_class(tag)
            out = f'<Glyph name="{g}" size={{{n}}}'
            if cls:
                out += f' className={cls}'
            return out + " />"

        src, k = re.subn(r'<' + re.escape(a) + r'(?=[\s/>])[^>]*?/>', repl, src)
        if k:
            notes.append(f"  {o}: {k} direct JSX")

    # 2. data values  `icon: Name`  /  `: Name,`  /  `: Name }`  ->  "glyph-name"
    for o, a in live:
        if o == "LucideIcon":
            continue
        g = MAP[o]
        pat = r'(:\s*)' + re.escape(a) + r'(?=\s*[,}\n])'
        src, k = re.subn(pat, lambda m, g=g: m.group(1) + f'"{g}"', src)
        if k:
            notes.append(f"  {o}: {k} data value")

    # 3. the LucideIcon type becomes GlyphName
    src = re.sub(r'\bLucideIcon\b', "GlyphName", src)

    # 4. drop the lucide imports, ensure a Glyph import
    src = re.sub(r'import\s+(?:type\s+)?\{[^}]*\}\s*from\s*"lucide-react";?\n', "", src, flags=re.S)
    if "GlyphName" in src and "from \"@/app/_components/Glyph\"" in src:
        src = re.sub(r'import\s*\{\s*Glyph\s*\}\s*from\s*"@/app/_components/Glyph";',
                     'import { Glyph, type GlyphName } from "@/app/_components/Glyph";', src)
    elif "from \"@/app/_components/Glyph\"" not in src:
        imp = 'import { Glyph, type GlyphName } from "@/app/_components/Glyph";' \
            if "GlyphName" in src else 'import { Glyph } from "@/app/_components/Glyph";'
        m = list(re.finditer(r'^import .*?;$', src, re.M))
        if m:
            src = src[:m[-1].end()] + "\n" + imp + src[m[-1].end():]

    if src != orig:
        open(path, "w", encoding="utf-8").write(src)
        return True, [path] + notes
    return False, []


targets = []
for root, dirs, files in os.walk("app"):
    dirs[:] = [d for d in dirs if d not in (".next", "node_modules")]
    for f in files:
        if not f.endswith((".tsx", ".ts")):
            continue
        p = os.path.join(root, f)
        if any(s in p for s in INTERNAL):
            continue
        targets.append(p)

changed = 0
for p in sorted(targets):
    ok, notes = convert(p)
    if notes:
        print("\n".join(notes))
    if ok:
        changed += 1
print(f"\nfiles changed: {changed}")
