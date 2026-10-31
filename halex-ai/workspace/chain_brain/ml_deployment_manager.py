"""Module 9: Machine Learning Model Training and Cloud Deployment Blueprints
(ml_deployment_manager.py).

Python standard library only.
- Trains mathematical models on stored memory data using standard
  library statistical algorithms.
- Generates cloud deployment blueprints and manifests stored in the
  chain-brain, ready for future migration.

Gate note (Allen, 2026-10-30): THREE fixes to the returned code.
(1) The original stored model/blueprint records with hardcoded
categories ("ml_model", "cloud_blueprint") that did NOT match the
agency's category, so ``memory_store.store_record`` refused them
with CATEGORY_MISMATCH -- while ``train_model`` still returned
TRAINED_MODEL_STORED. A stored claim on a refused store is a
fabricated success. This version stores under the agency's own
category and CHECKS the store result: a failed store is reported
as TRAINED_NOT_STORED / BLUEPRINT_NOT_STORED, never as stored.
(2) The original validated nothing about the chain/agency and
silently overwrote a duplicate model id. This version validates
chain + agency + agency-chain membership first, refuses duplicate
model ids, refuses non-finite values, and refuses constant-x data
(where OLS slope is undefined) instead of inventing slope 0.0.
(3) Blueprints are TEXT MANIFESTS. Nothing here provisions cloud
infrastructure, calls a cloud API, or runs a container. "Ready
for migration" means the manifest text is written and stored,
nothing more.
"""

import math
from typing import Dict, Any, List


class MLDeploymentManager:
    def __init__(self, registry, memory_store, agency_manager):
        self.registry = registry
        self.memory_store = memory_store
        self.agency_manager = agency_manager
        self.models: Dict[str, Dict[str, Any]] = {}
        self.blueprints: Dict[str, Dict[str, Any]] = {}

    def _validate_home(self, chain_id: str, agency_id: str) -> Dict[str, Any]:
        chain_res = self.registry.get_chain(chain_id)
        if chain_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "CHAIN_NOT_FOUND"}
        agency_res = self.agency_manager.get_agency(agency_id)
        if agency_res["status"] == "NOT_FOUND":
            return {"status": "NOT_FOUND", "reason": "AGENCY_NOT_FOUND"}
        agency = agency_res["agency"]
        if agency["chain_id"] != chain_id:
            return {"status": "ERROR", "reason": "AGENCY_DOES_NOT_BELONG_TO_CHAIN"}
        return {"status": "OK", "agency": agency}

    def train_model(self, model_id: str, chain_id: str, agency_id: str,
                    x_values: List[float], y_values: List[float]) -> Dict[str, Any]:
        if model_id in self.models:
            return {"status": "ERROR", "reason": "MODEL_ALREADY_EXISTS"}
        home = self._validate_home(chain_id, agency_id)
        if home["status"] != "OK":
            return home
        if (len(x_values) != len(y_values) or len(x_values) == 0
                or not all(isinstance(v, (int, float)) and math.isfinite(v)
                           for v in list(x_values) + list(y_values))):
            return {"status": "ERROR", "reason": "INVALID_TRAINING_DATA"}

        # Ordinary Least Squares (OLS) linear regression, pure stdlib math.
        n = len(x_values)
        mean_x = sum(x_values) / n
        mean_y = sum(y_values) / n
        num = sum((x_values[i] - mean_x) * (y_values[i] - mean_y) for i in range(n))
        den = sum((x_values[i] - mean_x) ** 2 for i in range(n))
        if den == 0:
            return {"status": "ERROR", "reason": "CONSTANT_X_VALUES_SLOPE_UNDEFINED"}
        slope = num / den
        intercept = mean_y - slope * mean_x
        mse = sum((y_values[i] - (slope * x_values[i] + intercept)) ** 2
                  for i in range(n)) / n

        model_artifact = {
            "model_id": model_id,
            "chain_id": chain_id,
            "agency_id": agency_id,
            "algorithm": "linear_regression_ols",
            "parameters": {"slope": slope, "intercept": intercept},
            "metrics": {"mean_squared_error": mse, "sample_count": n},
        }
        self.models[model_id] = model_artifact

        # Store under the agency's own category, and check the result.
        category = home["agency"]["category"]
        content_str = f"Model {model_id} [OLS]: slope={slope}, intercept={intercept}, mse={mse}"
        store_res = self.memory_store.store_record(
            f"model-rec-{model_id}", chain_id, agency_id, category,
            content_str, provenance="internal-training")
        if store_res["status"] != "STORED":
            return {
                "status": "TRAINED_NOT_STORED",
                "reason": store_res.get("reason", store_res["status"]),
                "model": model_artifact,
            }
        return {"status": "TRAINED_MODEL_STORED", "model": model_artifact}

    def generate_deployment_blueprint(self, model_id: str, target_cloud: str,
                                       chain_id: str, agency_id: str) -> Dict[str, Any]:
        if model_id not in self.models:
            return {"status": "NOT_FOUND", "reason": "MODEL_NOT_FOUND"}
        if not target_cloud or not isinstance(target_cloud, str):
            return {"status": "ERROR", "reason": "INVALID_TARGET_CLOUD"}
        home = self._validate_home(chain_id, agency_id)
        if home["status"] != "OK":
            return home
        model = self.models[model_id]

        # Text manifest only. No cloud API call, no provisioning.
        blueprint_content = (
            f"TARGET_CLOUD: {target_cloud.upper()}\n"
            f"MODEL_ID: {model_id}\n"
            f"ALGORITHM: {model['algorithm']}\n"
            f"PARAMETERS: {model['parameters']}\n"
            f"DEPLOYMENT_STATUS: READY_FOR_MIGRATION\n"
            f"CONTAINER_RUNTIME: python:3.11-slim\n"
            f"SCALING_POLICY: automatic-shard-routing\n"
        )
        blueprint_id = f"blueprint-{model_id}-{target_cloud.lower()}"
        self.blueprints[blueprint_id] = {
            "blueprint_id": blueprint_id,
            "model_id": model_id,
            "target_cloud": target_cloud,
            "manifest": blueprint_content,
        }
        category = home["agency"]["category"]
        store_res = self.memory_store.store_record(
            f"rec-{blueprint_id}", chain_id, agency_id, category,
            blueprint_content, provenance="blueprint-generator")
        if store_res["status"] != "STORED":
            return {
                "status": "BLUEPRINT_NOT_STORED",
                "reason": store_res.get("reason", store_res["status"]),
                "blueprint_id": blueprint_id,
                "manifest": blueprint_content,
            }
        return {
            "status": "BLUEPRINT_GENERATED",
            "blueprint_id": blueprint_id,
            "manifest": blueprint_content,
        }
