# GSD (Get Shit Done) in this project

This project uses **GSD for Cursor** — a meta-prompting and spec-driven workflow for building software with AI.

- **Repo (cloned):** `c:\dev\gsd-for-cursor` (from `rmindel/gsd-for-cursor`)
- **Installed to:** `~/.cursor/` (commands, agents, workflows, templates, hooks)

## How to use in Cursor

1. In the chat/command box, type **`/gsd`** to see GSD commands.
2. **`/gsd-help`** — list all commands and usage.
3. **`/gsd-map-codebase`** — map this codebase (good first step for existing projects).
4. **`/gsd-new-project`** — full init (questioning → research → requirements → roadmap) for new work.
5. **`/gsd-discuss-phase 1`** — capture how you want phase 1 to work.
6. **`/gsd-plan-phase 1`** — create an executable plan for phase 1.
7. **`/gsd-execute-phase 1`** — run the plan (atomic commits).
8. **`/gsd-verify-work 1`** — acceptance check for the phase.

## Updating GSD

```powershell
cd c:\dev\gsd-for-cursor
git pull
.\scripts\install.ps1 -Force
```

See `c:\dev\gsd-for-cursor\README.md` and `docs\GSD-CURSOR-ADAPTATION.md` for full details.
