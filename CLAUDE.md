# CLAUDE.md

Working notes for Claude Code (and human contributors) in this repo.

## What this is

The **DAS KARTELL / IRIDIUM design system** — the visual source of truth for the *Profit Basetool*,
the squadron-management app of the „DAS KARTELL" Star Citizen organisation. A dark, sci-fi
„technical HUD" brand: house orange `#E77E23` on black, **Lato** as the single typeface (headlines
bold + UPPERCASE), square-cornered containers framed with diagonal corner brackets, and a fixed
department colour system.

`README.md` is the source of truth for colours, typography and components; `SKILL.md` is the skill
entry point. This repository is consumed by the `basetool` repo as a **git submodule** at
`.claude/skills/das-kartell-design/`, and both the web frontend and the Android app are built
against it.

> [!IMPORTANT]
> **A change here changes two products.** The web frontend and the Android app both build against
> this system, and the Android artboards are derived from it. A colour, a spacing token or a
> component contract that moves here moves in both — and the app is verified screen-by-screen
> against its artboards, so a silent change surfaces as a parity failure somewhere else entirely.

## The knowledge base (HARD RULE — read before every task)

The **Basetool Knowledge Base** is the single source of truth about the Profit Basetool as a whole:
an Obsidian vault and git repository (`basetool-knowledge`), sitting beside this repository in the
workspace. It covers every part of the system — backend, frontend, ingest, keycloak-spi, the Android
app, the SC extractor, the P4K reader, **and this design system** — plus the roles, permissions,
decisions, incidents and runbooks around them.

**This rule is binding on every AI agent working on the Basetool or any of its parts and
repositories, without exception.**

- **Read it before you start any task**, not after. Enter through its root map
  (`00 Maps/Basetool.md`); its own `CLAUDE.md` explains how it is written. For this repo start with
  `Design System`, `Frontend`, `Android App` and `Web Parity Programme` — they record which parts of
  this system are *binding* rather than illustrative, how an artboard is rendered and compared
  against a running screen, and which specificity traps have already cost time.
- **Every change here updates the knowledge base in the same unit of work**: a new or changed
  component, a colour or token, a contract the consumers rely on, a rule learned from a rendering
  failure. It is not written afterwards and never „caught up later".
- The vault is a **separate git repository**, so nothing here can gate it. That is exactly why it is
  a hard rule: no build will fail if you skip it, and skipping it is still an incomplete change.
- **It must never drift from reality.** It represents the truth about this project and every part of
  the system orients by it — a drifted vault is worse than none, because each stale note still reads
  as authoritative. **If you notice it is out of date, incomplete, or does not cover something,
  update or extend it immediately as part of the work in hand**, even when the gap lies outside your
  task. When the vault and this repository disagree, **this repository is right** for design facts,
  and the note gets corrected in the same session, saying so and dated.
- Move `updated:` on every note you re-checked, and run `python "90 Meta/vaultcheck.py"` from the
  vault root before committing.
- **If you cannot find the vault, ask the user where it is at the start of the session.** Its
  location is workspace-specific and it is **not** a submodule, so a fresh machine, a worktree or a
  CI runner may simply not have it beside this repo. Do not guess a path, do not proceed as if the
  rule did not apply, and do not silently skip it — a missing vault is a question to ask, never a
  rule to drop.

> **Never a secret and never personal data in the vault.** It is a git repository that must stay
> safe to push anywhere: no tokens, keys or `.env` contents, and no member names, e-mail addresses
> or Discord handles. Screenshots taken for documentation are covered by the same rule — a capture
> of a real screen carries real member data.

## Conventions

- **Prose in English** — this file, `README.md`, commit messages, PR titles and bodies, issues. The
  brand's own German product words („Einsätze", „Lager", „Kartellbank") are quoted as they ship.
- **Only OFL-licensed fonts in the repository.** Lato (SIL OFL) is the whole type system; the
  commercial display face used in brand material ships nowhere.
- **`README.md` is the source of truth.** When a value appears both there and in a CSS file, the
  README is what a consumer is told to read — keep them in step, and change the README in the same
  commit.
