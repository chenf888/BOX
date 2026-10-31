# -*- coding: utf-8 -*-
# One-shot: convert static `FIELD: L("cn", "en")` fields to functions so the tmp
# system re-evaluates them per tick and the language toggle applies live.
# (Load-time L() calls freeze to EN because player is undefined when mod files load.)
import io, re

FILES = ["layer_s.js", "layer_row1.js", "layer_row2.js", "layer_row3.js", "layer_zeta.js", "side_layers.js"]
PAT = re.compile(r'\b([a-zA-Z]+): L\(("(?:[^"\\]|\\.)*"), ("(?:[^"\\]|\\.)*")\)')
total = 0
for fn in FILES:
    p = "E:/Idle-Skill/The-Prime-Conjecture-Tree/js/" + fn
    with io.open(p, encoding="utf-8") as f:
        s = f.read()
    s2, n = PAT.subn(r'\1() { return L(\2, \3) }', s)
    if n:
        with io.open(p, "w", encoding="utf-8", newline="") as f:
            f.write(s2)
    print(fn, n)
    total += n
print("TOTAL converted:", total)

# 11 plain layer names -> live bilingual names
NAMES = {
    "layer_s.js": ('name: "the Sieve"', 'name() { return L("筛子", "the Sieve") }'),
    "layer_zeta.js": ('name: "Riemann Zeta"', 'name() { return L("黎曼 ζ", "Riemann Zeta") }'),
    "layer_row3.js": ('name: "Prime Pairs"', 'name() { return L("素数对", "Prime Pairs") }'),
    "layer_row3.js#2": ('name: "The Pantheon"', 'name() { return L("先贤祠", "The Pantheon") }'),
    "layer_row1.js": ('name: "Prime Counting"', 'name() { return L("素数计数", "Prime Counting") }'),
    "layer_row1.js#2": ('name: "Factorization"', 'name() { return L("因数分解", "Factorization") }'),
    "layer_row1.js#3": ('name: "Prime Gaps"', 'name() { return L("素数间隔", "Prime Gaps") }'),
    "layer_row1.js#4": ('name: "Lemma Library"', 'name() { return L("引理书库", "Lemma Library") }'),
    "layer_row2.js": ('name: "Prime Number Theorem"', 'name() { return L("素数定理", "Prime Number Theorem") }'),
    "layer_row2.js#2": ('name: "Wilson\'s Theorem"', 'name() { return L("威尔逊定理", "Wilson\'s Theorem") }'),
    "layer_row2.js#3": ('name: "Open Problems"', 'name() { return L("未决问题馆", "Open Problems") }'),
}
for key, (old, new) in NAMES.items():
    fn = key.split("#")[0]
    p = "E:/Idle-Skill/The-Prime-Conjecture-Tree/js/" + fn
    with io.open(p, encoding="utf-8") as f:
        s = f.read()
    if old in s:
        s = s.replace(old, new, 1)
        with io.open(p, "w", encoding="utf-8", newline="") as f:
            f.write(s)
        print("name ok:", key)
    else:
        print("NAME MISS:", key, repr(old))
