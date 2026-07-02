# AI Model Image Library

These folders group visually similar generated model images by archetype and pose. The images are fictional demo assets used by seeded beta profiles; they do not represent real members.

The app still references individual pose files from `src/features/matching/data/seedProfiles.ts`.

| Folder | Seed profile | Original files | Pose files | Notes |
| --- | --- | --- | --- | --- |
| `model-01-corporate` | Maria | `ai1.webp` to `ai5.webp` | `pose-01-office-window.webp` to `pose-05-cafe-white-blouse.webp` | Corporate and cafe portraits with similar professional styling. |
| `model-02-beach` | Angela | `ai6.webp`, `ai7.webp` | `pose-01-sunlit-shore.webp`, `pose-02-beach-recline.webp` | Beach lifestyle variants. |
| `model-03-evening` | Grace | `ai8.webp` to `ai11.webp` | `pose-01-gray-gown.webp` to `pose-04-lounge-dress.webp` | Formal and eveningwear variants. |
| `model-04-business` | Samantha | `ai12.webp` | `pose-01-blue-suit-interior.webp` | Business interior portrait. |
| `model-05-creative` | Kyla | `ai13.webp` | `pose-01-office-tablet.webp` | Creative professional portrait. |
| `model-06-garden` | Francesca | `ai14.webp` | `pose-01-garden-dress.webp` | Soft garden portrait. |
| `model-07-urban` | Leah | `ai15.webp` | `pose-01-street-casual.webp` | Casual street portrait. |
| `model-08-red-hair` | Trisha | `girl1.webp` to `girl5.webp` | `pose-01-closeup-wink.webp` to `pose-05-red-outfit.webp` | Red-haired social and event variants. |

Each model folder has:

- `biography.md`: fictional background for demo writing and future content metadata.
- `personality.md`: tone, behavior, and safety notes for consistent seeded profile copy.

The runtime catalog lives in `src/features/matching/data/aiModelCatalog.ts`.
The seeded people using the catalog live in `src/features/matching/data/seedProfiles.ts`.
