# Classifier (`ml/`)

Not implemented in this checkpoint.

When added, keep a single interface with swappable backends:

- `mock` — fixed or seeded scores so the rest of the app can be built
- `rules` — heuristics from text/size
- `vision` — external model (vendor not chosen)
- `custom` — fine-tuned / in-house model

Callers must receive `complexity_score` (1–5), `complexity_category`, and `confidence`. Pricing must consume only the score (plus quote fields), never this package’s internals.
