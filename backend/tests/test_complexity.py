from app.services.complexity import predict_complexity


def test_missing_image_uses_bounded_fallback():
    prediction = predict_complexity([], "una piñata")
    assert prediction.complexity_score == 3
    assert 0 <= prediction.confidence <= 1
    assert prediction.reason
    assert prediction.model_version == "fallback-v1"


def test_unavailable_model_uses_fallback(tmp_path):
    image = tmp_path / "idea.png"
    image.write_bytes(b"image")
    prediction = predict_complexity([str(image)], "una piñata", backend="unavailable")
    assert 1 <= prediction.complexity_score <= 5
    assert 0 <= prediction.confidence <= 1
    assert prediction.reason


def test_baseline_prediction_is_bounded_and_versioned(tmp_path):
    image = tmp_path / "idea.png"
    image.write_bytes(b"image-reference" * 20)
    prediction = predict_complexity([str(image)], "una piñata")
    assert 1 <= prediction.complexity_score <= 5
    assert 0 <= prediction.confidence <= 1
    assert prediction.reason
    assert prediction.model_version == "baseline-v1"
