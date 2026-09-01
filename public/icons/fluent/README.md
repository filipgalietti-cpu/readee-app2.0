# Fluent Emoji (Flat) — vendored

Microsoft Fluent Emoji, Flat style, self-hosted.

Source:  https://github.com/microsoft/fluentui-emoji
Licence: MIT (see ./LICENSE) — Copyright (c) Microsoft Corporation.
         Commercial use and modification are expressly permitted.

Why self-hosted rather than a CDN or a native emoji character:
  - a native emoji renders as different artwork on every platform. Apple's
    carrot is not Google's carrot. We do not control any of it.
  - these are one fixed artwork on every device, sized and coloured by us.

Used for content and reward marks on CHILD-facing surfaces only. UI chrome
(arrows, chevrons, close, spinners) stays on Lucide — see CLAUDE.md.
