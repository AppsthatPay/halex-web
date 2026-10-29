"""Vibe-research-lab: factor registry pattern, mapped to token DNA fields.

Vibe source: agent/src/factors/registry.py
  AlphaMeta (strict, extra=forbid, frozen), Registry.list / get / compute /
  health / export_manifest, AST-only metadata loading, column validation.

Adaptation, and what was NOT copied:
  - No 478-alpha dump, no Qlib / GTJA / Alpha101 formulas, no equity /
    fundamental columns. Only the REGISTRY PATTERN was borrowed: a strict
    factor definition (id, theme, formula description, columns required,
    universe, decay horizon, warmup), validation of required columns,
    and a manifest export.
  - Universes here are base and solana only. Columns required are
    restricted to fields we actually have: token-DNA / dossier fields
    (custody, copycat_count, liquidity_usd, tape_buys, tape_sells,
    sell_sim_pct, metadata_present) and paper-history fields
    (paper_win_rate, paper_n_trades). A factor that needs a column we
    do not have fails validation openly, instead of returning a number.
  - compute() is implemented only for five mapped factors that can be
    computed from a candidate dict + paper history. Everything else must
    be registered with compute=None and is reported as not-computable
    here, not silently approximated.
"""

from __future__ import annotations

import re

_ID_RE = re.compile(r"^[a-z][a-z0-9_]+_[a-z0-9_]+$")
_THEMES = {
    "momentum", "reversal", "volume", "volatility", "quality", "value",
    "liquidity", "microstructure", "sentiment", "growth", "leverage",
    "custody", "copycat", "sellability",
}
_UNIVERSES = {"base", "solana"}
_ALLOWED_COLUMNS = {
    "custody", "copycat_count", "liquidity_usd", "tape_buys", "tape_sells",
    "sell_sim_pct", "metadata_present", "paper_win_rate", "paper_n_trades",
}


class FactorError(ValueError):
    pass


class Factor:
    def __init__(self, factor_id, theme, formula, columns_required, universe,
                 decay_horizon=0, min_warmup_bars=0, notes=""):
        if not _ID_RE.match(factor_id):
            raise FactorError(f"bad factor id: {factor_id}")
        bad_themes = [t for t in theme if t not in _THEMES]
        if bad_themes:
            raise FactorError(f"unknown themes: {bad_themes}")
        bad_cols = [c for c in columns_required if c not in _ALLOWED_COLUMNS]
        if bad_cols:
            raise FactorError(f"unknown columns (not a DNA/paper field): {bad_cols}")
        bad_univ = [u for u in universe if u not in _UNIVERSES]
        if bad_univ:
            raise FactorError(f"unknown universes: {bad_univ}")
        if not (0 <= decay_horizon <= 512):
            raise FactorError("decay_horizon must be 0..512")
        self.id = factor_id
        self.theme = list(theme)
        self.formula = formula
        self.columns_required = list(columns_required)
        self.universe = list(universe)
        self.decay_horizon = decay_horizon
        self.min_warmup_bars = min_warmup_bars
        self.notes = notes

    def to_dict(self):
        return {
            "id": self.id, "theme": self.theme, "formula": self.formula,
            "columns_required": self.columns_required, "universe": self.universe,
            "decay_horizon": self.decay_horizon,
            "min_warmup_bars": self.min_warmup_bars, "notes": self.notes,
        }


def _sellability(candidate):
    v = candidate.get("sell_sim_pct")
    return None if v is None else float(v) / 100.0


def _copycat_risk(candidate):
    v = candidate.get("copycat_count")
    return None if v is None else (1.0 if int(v) >= 10 else int(v) / 10.0)


def _custody_risk(candidate):
    c = (candidate.get("custody") or "").lower()
    if "deployer" in c or "pullable" in c:
        return 1.0
    if "burned" in c or "locked" in c:
        return 0.0
    return None  # undetermined: do not guess


def _tape_imbalance(candidate):
    buys = candidate.get("tape_buys")
    sells = candidate.get("tape_sells")
    if buys is None or sells is None or (int(buys) + int(sells)) == 0:
        return None
    return (int(buys) - int(sells)) / (int(buys) + int(sells))


def _paper_momentum(candidate):
    return candidate.get("paper_win_rate")


_COMPUTABLE = {
    "dna_sellability": _sellability,
    "dna_copycat_risk": _copycat_risk,
    "dna_custody_risk": _custody_risk,
    "dna_tape_imbalance": _tape_imbalance,
    "dna_paper_momentum": _paper_momentum,
}


class Registry:
    def __init__(self):
        self._factors = {}

    def register(self, factor):
        if factor.id in self._factors:
            raise FactorError(f"duplicate factor id: {factor.id}")
        self._factors[factor.id] = factor

    def list(self, theme=None, universe=None):
        out = []
        for f in self._factors.values():
            if theme and theme not in f.theme:
                continue
            if universe and universe not in f.universe:
                continue
            out.append(f.id)
        return sorted(out)

    def get(self, factor_id):
        return self._factors[factor_id]

    def compute(self, factor_id, candidate):
        """Compute a mapped factor, or return None with a reason.

        Returns (value, reason). A missing input column is a reason, not
        a zero. Unmapped factors return (None, 'not computable here').
        """
        factor = self._factors[factor_id]
        missing = [c for c in factor.columns_required if candidate.get(c) is None]
        if missing:
            return None, f"missing columns: {missing}"
        fn = _COMPUTABLE.get(factor_id)
        if fn is None:
            return None, "registered but not computable in vibe-research-lab"
        value = fn(candidate)
        if value is None:
            return None, "input present but indeterminate (e.g. custody undetermined)"
        return value, "ok"

    def health(self):
        return {
            "loaded": len(self._factors),
            "computable_here": sorted(set(self._factors) & set(_COMPUTABLE)),
            "registered_only": sorted(set(self._factors) - set(_COMPUTABLE)),
        }

    def export_manifest(self):
        return {fid: f.to_dict() for fid, f in sorted(self._factors.items())}


def default_registry():
    """The five mapped DNA factors, plus one registered-only example."""
    reg = Registry()
    reg.register(Factor(
        "dna_sellability", ["sellability"],
        "sell_sim_pct / 100; 1.0 = full expected out, <0.90 = below live line",
        ["sell_sim_pct"], ["base", "solana"], decay_horizon=0,
        notes="Maps to the bridge PoVV / sell-sim gate. Gate stays authoritative."))
    reg.register(Factor(
        "dna_copycat_risk", ["copycat"],
        "copycat_count / 10 capped at 1.0; >=10 = full swarm risk",
        ["copycat_count"], ["base", "solana"], decay_horizon=0))
    reg.register(Factor(
        "dna_custody_risk", ["custody"],
        "1.0 if deployer-held/pullable, 0.0 if burned/locked, else indeterminate",
        ["custody"], ["base", "solana"], decay_horizon=0,
        notes="Undetermined custody returns None, never 0."))
    reg.register(Factor(
        "dna_tape_imbalance", ["volume", "microstructure"],
        "(buys - sells) / (buys + sells) over the reported window",
        ["tape_buys", "tape_sells"], ["base", "solana"], decay_horizon=0,
        notes="1.0 = buys only, the one-way tape pattern."))
    reg.register(Factor(
        "dna_paper_momentum", ["momentum"],
        "recorded paper win rate for the strategy, as supplied by the caller",
        ["paper_win_rate"], ["base", "solana"], decay_horizon=30,
        notes="Caller must supply the recorded rate; this module does not recompute win rates."))
    reg.register(Factor(
        "dna_metadata_presence", ["quality"],
        "registered only: whether website/socials/description exist",
        ["metadata_present"], ["base", "solana"], decay_horizon=0,
        notes="Not computable as a score here; presence is a flag for the debate report."))
    return reg
