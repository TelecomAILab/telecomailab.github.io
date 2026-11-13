---
title: "[Demo] Small research tools deserve good documentation"
slug: documenting-research-tools
date: "2026-07-09"
authors:
  - name: Author not listed
summary: A practical structure for a tool that someone else can understand, run, and cite.
tags:
  - Open research
  - Software
status: published
relatedPublications: []
isMock: true
---


## A README is an interface

Tell the reader what the tool does, what it expects, and what it produces. A runnable example should fit on a single screen.

```text
experiment/
  README.md
  config.json
  run.js
  results/
```

## Leave a trail

Record the tool version, input files, and configuration. State the license and how to cite the associated publication. Avoid implying that a tiny demo has been validated for production use.

## Write for a future collaborator

Explain common failure modes in plain language. A useful error message should help the reader take the next step.

Our [resource catalogue](/mare) provides sample downloads. The [experiment configuration note](/notes/experiment-configuration) gives a minimal starting point.
