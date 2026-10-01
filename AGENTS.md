> [!IMPORTANT]
> This project syncs with a hosted editor. Avoid rewriting published git history;
> force pushes and rebases of shared commits can lose project history. Keep the
> connected branch in a working state.

Keep fixed preview hostnames, message protocol keys, error bridge globals, and
the shared Vite preset dependency unchanged; they are integration contracts,
not application branding, and renaming them would break preview sessions or builds.
