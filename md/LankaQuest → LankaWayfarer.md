from pathlib import Path

content = """# LankaQuest → LankaWayfarer Brand Rename Plan

## Purpose

This document records the project-wide brand rename from:

**LankaQuest**

to:

**LankaWayfarer**

The rename is a **clean brand-only migration**.

## Important Rule

During this migration:

- Do not change existing application functionality.
- Do not redesign the architecture.
- Do not change Map logic.
- Do not change My Trip logic.
- Do not change Trip Planner behavior.
- Do not change Attractions functionality.
- Do not introduce unrelated bug fixes.
- Do not change data structures unless required only for the brand rename.
- Do not manually modify generated attraction pages when the generator is the source of those pages.

The goal is to preserve the current working project and change only the brand identity.

---

## New Brand

### Brand Name

**LankaWayfarer**

### Suggested Tagline

**Discover Sri Lanka. Travel Freely.**

### Brand Meaning

**Wayfarer** means a traveler or wanderer, giving the brand a sense of:

- freedom
- exploration
- discovery
- journeys
- travel across Sri Lanka

---

## Rename Scope

Search the entire repository for:

```text
LankaQuest
lankaquest
LANKAQUEST