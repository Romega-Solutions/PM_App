# PM_App Privacy Settings Surface Discipline

Date: 2026-06-11
Owner: Codex
Status: Source UI cleanup completed

## What changed

- Converted privacy setting controls from repeated card-like rows into one native settings group with dividers.
- Converted loading, error, hidden-profile, deletion-info, deletion-feedback, and account-deletion action surfaces into strips.
- Kept privacy behavior unchanged: settings still load/save through the backend, toggles stay locked after load failure, and account deletion remains a support-reviewed request.

## Why

Privacy settings are a trust and retention surface. They should feel like native app settings, not a dashboard of panels. Rows and strips make the hierarchy easier to scan while keeping safety warnings visible.

## Verification scope

This is source-level UI cleanup. Native-device visual QA remains required before production launch signoff.
