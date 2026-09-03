"""Swappable complexity-prediction interface and demonstrable local baseline.

This is deliberately not a trained vision model. Until owner-labelled Piñata
Monde images exist, the baseline produces a deterministic *suggestion* from an
uploaded image's basic byte characteristics. It keeps the quote pipeline and
owner feedback loop usable without fabricating a training dataset.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

CATEGORIES = ("simple", "medium", "complex")
MODEL_VERSION = "baseline-v1"


@dataclass(frozen=True)
class ComplexityPrediction:
    complexity_score: int
    confidence: float
    reason: str
    model_version: str = MODEL_VERSION


def category_for_score(complexity_score: int) -> str:
    if complexity_score in (1, 2):
        return "simple"
    if complexity_score == 3:
        return "medium"
    if complexity_score in (4, 5):
        return "complex"
    raise ValueError("complexity_score must be an integer from 1 to 5")


def fallback_prediction(reason: str = "No se recibió una imagen de referencia; se usa una estimación media para revisión.") -> ComplexityPrediction:
    return ComplexityPrediction(3, 0.30, reason, "fallback-v1")


def predict_complexity(image_paths: list[str], description: str, *, backend: str = "baseline") -> ComplexityPrediction:
    """Return a bounded prediction; unavailable/missing inputs always fall back.

    A future trained adapter should keep this function's return contract and
    model version, but must not become part of the pricing engine.
    """
    if backend == "unavailable":
        return fallback_prediction("El modelo no está disponible; se usa una estimación media para revisión.")
    if backend not in {"baseline", "mock"}:
        return fallback_prediction("No hay un modelo configurado; se usa una estimación media para revisión.")
    if not image_paths:
        return fallback_prediction()

    try:
        image = Path(image_paths[0]).read_bytes()
    except OSError:
        return fallback_prediction("No se pudo leer la imagen de referencia; se usa una estimación media para revisión.")
    if not image:
        return fallback_prediction("La imagen de referencia está vacía; se usa una estimación media para revisión.")

    # A stable demo signal only; it is not presented as trained image understanding.
    signal = (len(image) + sum(image[:256])) % 5
    score = signal + 1
    reasons = {
        1: "Referencia con señal visual simple; requiere validación del propietario.",
        2: "Referencia con pocos detalles estimados; requiere validación del propietario.",
        3: "Referencia de complejidad media estimada; requiere validación del propietario.",
        4: "Referencia con varios detalles estimados; requiere validación del propietario.",
        5: "Referencia con alta complejidad estimada; requiere validación del propietario.",
    }
    confidence = 0.55 if backend == "baseline" else 0.50
    return ComplexityPrediction(score, confidence, reasons[score], MODEL_VERSION if backend == "baseline" else "mock-v1")
