# 交情 · Ties

A complete [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) v2.7 incremental
game about human relationships — and about Dunbar's number.

You start as someone who can only make small talk. You end up with people you can call at
3am. The ceiling on how far you can go is **150**: the social circle is hard-capped, and
filling it *is* the win condition.

```
话头 → 寒暄 → 熟人 → 朋友 → 知己 → 社交圈 (150)
```

## Running it

It is a static site, but it needs to be served over HTTP (the browser blocks ES-module and
`localStorage` behaviour on `file://`):

```bash
npx http-server -c-1 .
# then open http://127.0.0.1:8080/index.html
```

`python -m http.server` or the VS Code Live Server extension work just as well.

Play tips: turn **Offline Prod off** in the settings tab before you judge the balance, and
only then touch `modInfo.offlineLimit`.

## The polyglot string layer

The unusual part of this repo. **Every sentence in the game exists in exactly one language,
and no two sentences share one** — 371 sentences, 371 languages. Reading the game is like
overhearing a room where everybody speaks at once. Cantonese, Wu, Hakka, Min Nan, Xiang,
Sámi, Yi, Ainu, extinct ones like Manchu and Khitan, constructed ones like Esperanto,
Volapük and toki pona.

- **重新洗牌** rotates which sentence sits in which language. The one-sentence-one-language
  rule always holds.
- The dropdown under **人际志 → 语言** switches the whole game into a single language:
  简体中文 / 繁體中文 / English. Those three are complete 371-string packs.
- **人际志 → 语言表** lists all 371 languages with what each one is currently saying.

How it works: `js/lang/pool_*.js` hold one row per sentence —
`[key, language code, phrase, endonym]`. `t("some.key")` in the layer files reads that table.
`重新洗牌` adds an offset into the same array. Adding a language is a data edit, not a code
change.

## Layout

| Path | Who owns it |
|---|---|
| `js/mod.js` | this game — economy root, `getPointGen`, endgame |
| `js/layers/*.js` | this game — the seven layers |
| `js/lang/*.js` | this game — the polyglot string layer |
| `js/tree.js` | this game — default tree layout |
| `js/technical/`, `js/components.js`, `js/game.js`, `js/utils.js`, `js/utils/` | **engine — do not edit** |
| `css/`, `index.html` | shared; `index.html` loads the `js/lang/` scripts before `mod.js` |
| `.tmt-profile.json` | build metadata: the interaction type and modifiers this game was generated for |
| `design-brief.md` | the full design document — layer table, automation ladder, cap table, balance walkthrough |

Every layer file must be listed in `modInfo.modFiles` or it silently never loads.

> ⚠️ **`modInfo.id` is `ties-ycsj8e`. Never change it.** It is the localStorage savefile key;
> changing it silently wipes every existing save.

## Credits and licensing

This game is a mod built on top of two upstream projects, both MIT licensed and both
retained verbatim:

- **The Modding Tree** — Copyright (c) 2020 Acamaeda. See [`LICENSE`](LICENSE).
- **The Prestige Tree** — Copyright (c) 2020 Jacorb. See [`Prestige-tree-license`](Prestige-tree-license).

The game design, the layer content and the polyglot string layer are the mod itself and carry
no separate licence claim from the engine authors.
