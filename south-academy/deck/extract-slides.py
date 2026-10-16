#!/usr/bin/env python3
"""Extrai um HTML por slide do deck indexado (indexed.html) e lista as imagens que cada slide usa.
   uso: python3 extract-slides.py <prefixo> <num> [<num> ...]   ex.: python3 extract-slides.py ep05 18 19 20 21 21A 21B
   Gera <prefixo>_tela_<num>.html ao lado de indexed.html. As imagens referenciadas como data:IMG[n] estão em img/imgNN.*."""
import re, sys, os, html
here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, "indexed.html"), encoding="utf8").read()
prefix, nums = sys.argv[1], sys.argv[2:]
parts = re.split(r'(?=<section class="slide)', s)
found = set()
for p in parts:
    m = re.search(r'slide-num"><b>([0-9]+[A-Z]?)', p)
    if not m or m.group(1) not in nums or m.group(1) in found:
        continue
    n = m.group(1); found.add(n)
    open(os.path.join(here, f"{prefix}_tela_{n}.html"), "w", encoding="utf8").write(p)
    imgs = re.findall(r'src="data:IMG\[(\d+)\]"', p)
    txt = html.unescape(re.sub(r"<[^>]+>", "\n", re.sub(r"<(script|style)[^>]*>.*?</\1>", "", p, flags=re.S)))
    lines = [l.strip() for l in txt.split("\n") if l.strip()]
    cut = next((i for i, l in enumerate(lines) if l.startswith("Notas do slide")), len(lines))
    print("=====", n, "IMG", imgs); print(" | ".join(lines[:cut])[:1500])
print("missing:", [n for n in nums if n not in found])
