# Braille data attribution

`js/lang/braille_map.js` is generated from the Chinese braille table
`tools/zhcn-g1.ctb`, which is part of **liblouis**:

- Project: https://github.com/liblouis/liblouis
- Table: `tables/zhcn-g1.ctb` (Chinese Current Braille System)
- Copyright (C) 2018 Sunian Loomee and the NVDA Chinese website
- License: GNU Lesser General Public License, version 2.1 or later

The table is used here only to generate a character/phrase → braille-cell map
for display. The generated map is distributed under the same LGPL-2.1-or-later
terms. The rest of this game is not derived from liblouis.

English braille uses the standard Grade-1 letter assignments (a–z, punctuation,
number sign) and is implemented directly in `js/lang/braille.js`.
