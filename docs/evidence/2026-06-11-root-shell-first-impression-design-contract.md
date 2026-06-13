# PM_App root shell first-impression design contract

Date: 2026-06-11

## Scope

PM_App product-design contract coverage for the root app shell and splash entry.

## What changed

- Added `app/_layout.tsx` to the product design contract required files.
- Added markers for session restoration, loading copy, background color, status bar, route stack setup, and transition behavior.
- Added `app/index.tsx` to the product design contract required files.
- Added markers for the PinayMate logo label, brand name, first-impression tagline, loading accessibility label, responsive text scaling, brand colors, and unauthenticated redirect path.

## Why

The client-facing copy guard already scans the `app` route tree. This update covers a different gap: the product-design contract now protects the root loading and splash surfaces that shape the first impression before users reach auth or matching flows.

## Files touched

- `scripts/check-product-design-contract.mjs`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove the product design contract passes, TypeScript passes, Expo runtime behavior works, native splash behavior is correct, or production readiness is complete.
