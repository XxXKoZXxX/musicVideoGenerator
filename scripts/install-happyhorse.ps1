# install-happyhorse.ps1 — optional AI-video engine for the Music Video Generator.
#
# Installs the HappyHorse CLI (Alibaba HappyHorse 1.0 — AI text/image-to-video
# with native synchronized audio) so the app's "HappyHorse AI video" engine can
# use it. Run this ON YOUR WINDOWS MACHINE, not inside the web sandbox:
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\install-happyhorse.ps1
#
# or paste the one-liner directly:
#
#   irm https://happyhorse-cli-releases.oss-accelerate.aliyuncs.com/happyhorse-cli/install.ps1 | iex
#
# After installing, start the app and pick Engine > "HappyHorse AI video" in the
# AI Director (or tell the agent "use happyhorse"). The app auto-detects the CLI.
# If you installed to a custom location, set HH_CLI_PATH to the full binary path.
#
# The installer verifies the download with SHA256SUMS + an Authenticode
# signature before installing, and installs per-user (no admin needed).

irm https://happyhorse-cli-releases.oss-accelerate.aliyuncs.com/happyhorse-cli/install.ps1 | iex

Write-Host ""
Write-Host "Done. Verify with:  happyhorse --version" -ForegroundColor Cyan
Write-Host "Then run 'happyhorse login' once to authenticate with the generation service."
