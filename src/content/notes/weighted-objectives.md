---
title: "[Demo] Reading a weighted objective carefully"
slug: weighted-objectives
date: "2026-08-13"
authors:
  - personId: 101
summary: Units and normalisation matter when combining performance and resource cost in one expression.
tags:
  - Optimisation
  - Modelling
coverImage: ../../assets/editorial/wireless.svg
coverAlt: A schematic network of connected nodes
status: published
relatedPublications:
  - nguyen2025semantic
isMock: true
---


## Keep the units visible

For an illustrative objective $J = R - \lambda E$, the coefficient $\lambda$ carries the units needed to make the terms comparable. Rescaling $R$ without changing $\lambda$ changes the trade-off.

$$
\widetilde{J} = \frac{R}{R_{\mathrm{ref}}} - \alpha\frac{E}{E_{\mathrm{ref}}}.
$$

## Explain the reference values

Reference values are modelling choices, not neutral constants. Record how they were chosen and inspect sensitivity to plausible alternatives.

For broader context, browse the [research areas](/research) and the explicitly linked demo publication below.
