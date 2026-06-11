# Discovery UI safety polish

Date: 2026-06-11
Owner: Codex

## Scope result

- Primary discovery browsing screen found: `PM_App/src/features/matching/screens/DiscoverScreen.tsx`.
- Supporting discovery card UI found: `PM_App/src/features/matching/components/ProfileCard.tsx`.
- Match empty-state UI found: `PM_App/src/features/matching/components/EmptyMatchesState.tsx`.
- Requested writable feature path `PM_App/src/features/discovery/**` is not present in this checkout.

## UX rationale

- The intended polish belongs in the active matching feature, because the main tab imports `DiscoverScreen` from `src/features/matching`.
- Recommended copy direction: keep safety wording bounded to visible controls, reporting, respectful browsing, and profile visibility; avoid claims about background checks, guaranteed safety, or guaranteed matches.
- Recommended UI direction: add a concise privacy/safety boundary near the browsing actions, keep empty-state actions clear, and preserve the existing dark gradient, pink/purple accents, rounded controls, and React Native accessibility labels.

## Validation status

- No code changes were made to the active discovery UI because those files are outside the assigned write scope.
- Tests, build, lint, and typecheck were not run by instruction.
- No runtime or visual validation was run by instruction.

## Integration note

- To complete the UI slice, allow edits under `PM_App/src/features/matching/**` or move the active discovery implementation into `PM_App/src/features/discovery/**` first.
