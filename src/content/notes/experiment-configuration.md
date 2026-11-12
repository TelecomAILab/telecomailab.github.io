---
title: "[Demo] A minimal experiment configuration"
slug: experiment-configuration
date: "2026-09-24"
authors:
  - personId: "2008"
summary: "Keep experiment settings separate from the implementation and save the exact configuration with each result."
tags: [Software, Experiments]
status: published
isMock: true
---

This synthetic configuration is a documentation example, not a recommended scientific protocol.

## An explicit starting point

```json
{
  "seed": 42,
  "scenario": "synthetic-small",
  "steps": 100,
  "policy": "largest-queue"
}
```

## Save what was actually used

If a command-line flag overrides a value, save the resolved configuration rather than only the original file. This makes it possible to inspect a result without reconstructing every command.

Download an [experiment template](/files/resources/experiment-template.md) or return to [Materials & Resources](/mare).
