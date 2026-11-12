---
title: "[Demo] Keeping edge-learning comparisons honest"
slug: edge-learning-comparisons
date: "2026-10-15"
authors:
  - personId: "2003"
  - name: "Taylor Morgan (fictional collaborator)"
summary: "Why a shared dataset is only the beginning of a fair comparison between distributed learning methods."
tags: [Edge learning, Methods]
coverImage: ../../assets/editorial/edge.svg
coverAlt: "A schematic of connected edge-learning participants"
status: published
relatedPublications: ["1002"]
isMock: true
---


## Compare the experimental contract

Two methods can use the same dataset and still answer different questions. Client sampling, communication limits, and validation schedules belong in the experimental description.

A simple weighted aggregation rule is:

$$
w_{t+1} = \sum_{k=1}^{K}\frac{n_k}{\sum_j n_j}w_{t+1}^{(k)}.
$$

This familiar illustrative expression says nothing about convergence under a particular system model. State the assumptions before interpreting a plot.

## Document the constraints

- Record how clients are sampled.
- Keep data partitions and seeds available.
- Report the stopping criterion.
- Distinguish wall-clock time from the number of rounds.

## Share something small and useful

An explicit configuration file is often more helpful than a screenshot. See the [Materials & Resources catalogue](/mare) for synthetic examples and the [technical notes](/notes) for practical checklists.
