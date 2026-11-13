---
title: "[Demo] A checklist for reproducible runs"
slug: reproducible-runs
date: "2026-10-30"
authors:
  - name: Author not listed
summary: The information to save before an experiment becomes difficult to reconstruct.
tags:
  - Reproducibility
  - Checklist
status: published
isMock: true
---


## Before the run

1. Save the configuration and source revision.
2. Record the data split and random seed.
3. State the stopping criterion and evaluation schedule.

## After the run

Keep raw outputs, an environment description, and the commands used to produce plots. Explain any manual changes rather than silently replacing a result.

A seed is useful, but it is not a promise of bitwise determinism across hardware and libraries. Report the level of reproducibility you actually checked.

See the longer [wireless experiment article](/blog/learning-to-schedule).
