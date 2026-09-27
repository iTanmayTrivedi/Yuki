<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

> [!IMPORTANT]
> This project syncs with a hosted editor. Avoid rewriting published git history;
> force pushes and rebases of shared commits can lose project history. Keep the
> connected branch in a working state.

Keep fixed preview hostnames, message protocol keys, error bridge globals, and
the shared Vite preset dependency unchanged; they are integration contracts,
not application branding, and renaming them would break preview sessions or builds.
