"""Staging multi-source corroboration rules (H3 Verifier lane).

Deterministic, pure function over its inputs. No network access,
no dynamic code, no invented facts. Not wired into any engine:
halex_ai_selfbuild/cycle.py and every other engine file are untouched.
This draft stays PENDING for Allen's review.

corroborate(claim, sources) where each source is a dict with:
  name: str — source identifier; duplicates by name count once.
  independent: bool — True only for a source independent of the others.
  kind: "independent" | "vendor" | "primary".
  figure: optional — a figure offered by the source, if any.

Rules:
  - 2+ distinct-name, independent, non-vendor sources -> "verified".
  - Exactly 1 such source -> "single-source", labelled
    "1-source label - not corroborated".
  - 0 such sources -> "unverified".
  - ANY vendor-kind source offering a figure -> that figure is
    refused: the verdict includes "vendor-figure refused", and the
    figure is never returned as fact (the result carries no figure
    value at all).
  - Two sources with the SAME name do not count as 2 (dedupe by name).
  - A vendor source alone never verifies, even if it claims to be
    independent: vendor kind is excluded from the qualifying count.
"""

LABEL_SINGLE = "1-source label - not corroborated"
VENDOR_REFUSAL = "vendor-figure refused"


def _dedupe_by_name(sources):
    """Keep the first source seen for each distinct non-empty name."""
    seen = {}
    for source in sources or []:
        if not isinstance(source, dict):
            continue
        name = source.get("name")
        if not name or name in seen:
            continue
        seen[name] = source
    return list(seen.values())


def corroborate(claim, sources):
    """Return a verdict dict for a claim over the given sources."""
    deduped = _dedupe_by_name(sources)

    vendor_figure_refused = any(
        s.get("kind") == "vendor" and s.get("figure") is not None
        for s in deduped
    )

    qualifying = [
        s for s in deduped
        if s.get("independent") is True and s.get("kind") != "vendor"
    ]
    count = len(qualifying)

    if count >= 2:
        verdict = "verified"
        label = ""
    elif count == 1:
        verdict = "single-source"
        label = LABEL_SINGLE
    else:
        verdict = "unverified"
        label = ""

    if vendor_figure_refused:
        verdict = verdict + " (vendor-figure refused)"
        if not label:
            label = VENDOR_REFUSAL
        else:
            label = label + "; " + VENDOR_REFUSAL

    # Deliberately no "figure" key: a refused vendor figure is never
    # returned as fact, and no figure is adopted from any source.
    return {
        "claim": claim,
        "verdict": verdict,
        "label": label,
        "independent_source_count": count,
        "qualifying_sources": [s.get("name") for s in qualifying],
        "vendor_figure_refused": vendor_figure_refused,
    }
