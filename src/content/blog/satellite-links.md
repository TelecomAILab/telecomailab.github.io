---
title: "[Demo] Thinking in timescales for satellite networks"
slug: satellite-network-timescales
date: "2026-09-03"
authors:
  - name: Author not listed
  - name: Author not listed
summary: A working sketch of how propagation, scheduling, and learning timescales shape a network model.
tags:
  - Satellite networks
  - Modelling
coverImage: ../../assets/editorial/orbit.svg
coverAlt: An orbital network illustration
status: published
relatedPublications: []
isMock: true
---


## Start with the clock

A controller does not see the world continuously. Measurements arrive at intervals, decisions take time, and links evolve while computations are running. Write these timescales down before selecting a policy.

## Separate state from observation

A delayed observation is not the current physical state. A small state diagram can clarify where the delay enters the experiment.

![An illustrative connected-system sketch](../../assets/editorial/orbit.svg)

## Turn the sketch into a test

Start with a fixed scenario. Vary one delay at a time and keep a record of every assumption. A scenario file and a short README give future readers a more useful starting point than a claim of generality.

Continue with the [talks and seminars archive](/talks) or explore our [research themes](/research).
