# ML Service Layer (Python) — OleaCare

Ce dossier n'est plus un serveur Flask.

Il est maintenant une **couche de service Python** qui:
- intègre des modèles ML externes,
- centralise la communication avec ces modèles,
- fournit un bridge CLI JSON utilisé par le backend Node.js.

## Architecture

- `app/services/external_ml_client.py`
  - gère les appels HTTP vers les endpoints externes:
    - `/predict/quality`
    - `/predict/quantity`
- `app/services/prediction_integration_service.py`
  - logique d'orchestration qualité + quantité
  - fallback mock optionnel
- `app/models.py`
  - logique mock locale (secours / démo)
- `app.py`
  - bridge CLI JSON (stdin/stdout), sans serveur web

## Installation

```bash
pip install -r requirements.txt
```

## Configuration (`.env`)

```env
ML_ALLOW_MOCK_FALLBACK=true
# EXTERNAL_ML_BASE_URL=http://localhost:9000
# EXTERNAL_ML_QUALITY_URL=http://localhost:9000/predict/quality
# EXTERNAL_ML_QUANTITY_URL=http://localhost:9000/predict/quantity
EXTERNAL_ML_TIMEOUT_SECONDS=10
```

## Utilisation CLI

### 1) Health / self test
```bash
python app.py self_test
```

### 2) Prédiction qualité
```bash
echo '{"temperature":25,"humidity":60,"soil_moisture":45,"light":800}' | python app.py quality
```

### 3) Prédiction quantité
```bash
echo '{"temperature":25,"humidity":60,"soil_moisture":45,"light":800,"terrain_hectares":2.5}' | python app.py quantity
```

### 4) Prédiction complète (qualité + quantité)
```bash
echo '{"temperature":25,"humidity":60,"soil_moisture":45,"light":800,"terrain_hectares":2.5}' | python app.py full_prediction
```

## Intégration backend Node.js

Le backend appelle le bridge Python via `child_process` (`full_prediction`), récupère le JSON et stocke le résultat en base.

Variables backend utiles:
- `ML_PYTHON_EXECUTABLE` (par défaut: `python`)
- `ML_BRIDGE_PATH` (par défaut: `ml-service/app.py`)

## Important

- Aucune logique Flask / API HTTP locale n'est nécessaire dans ce module.
- Le mode mock sert uniquement de fallback si le service externe n'est pas disponible.
