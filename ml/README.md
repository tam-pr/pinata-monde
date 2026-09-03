# Complexity prediction (`ml/`)

The current executable inference adapter lives in `backend/app/services/complexity.py` so it can participate in the quote transaction. It is a swappable **baseline**, not a trained Piñata Monde vision model.

It accepts saved reference-image paths and returns a bounded score (1–5), confidence, Spanish reason, and `model_version`. With no image, unreadable images, or an unavailable model it returns a medium-confidence fallback. This keeps the demo usable without pretending to have historical labels.

AI only estimates design complexity. It never sets shipping, size, quantity, deadline, or the final price; the owner reviews every suggestion.

## Future training data

Do not fabricate this data. A real supervised dataset should contain at least:

```text
image_path,complexity_score
```

The most useful additional labels are `owner_corrected_score` and `final_price`. Owner corrections collected during review become the feedback set for a future image model. A trained adapter must preserve the existing prediction contract and declare its own model version.
