# Critical bugs (trial stability)

Bugs that block or severely impact the trial. Fix each; document in SUMMARY.

**Additional trial-reported bugs:** list one per line below (description + file/location).

---

## Listed bugs

1. **Student signup error message loss** — `src/legacy.js` ~8919: catch block swallows error; user sees generic "Unexpected signup error: Try again." instead of actual RPC/validation message. **Addressed:** Inner catch now logs with `console.warn`, captures fallback RPC error and exception; user sees sanitized message (fallbackRpcError/fallbackCatchErr/e.message, max 200 chars).
