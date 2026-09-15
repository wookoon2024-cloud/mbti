# Taste

- Writes requests in Korean and expects the assistant's replies, UI copy, and README/docs to be in Korean. Confidence: 0.85
- Prefers Command Code AI (커맨드코드AI Provider API) as the AI backend when a project needs live model calls. Confidence: 0.7
- Gives short continuation instructions (e.g. "이어서해") and expects the agent to keep building autonomously without stopping to ask for confirmation. Confidence: 0.55
- Expects long-running operations to show visible intermediate progress — elapsed time, current step, and per-item status — rather than a single opaque spinner or a silent wait. Confidence: 0.75
- Prefers splitting large batch operations into smaller sequential per-item steps (often with an upfront listing/selection step) so one failure or timeout doesn't take down the whole run. Confidence: 0.7
