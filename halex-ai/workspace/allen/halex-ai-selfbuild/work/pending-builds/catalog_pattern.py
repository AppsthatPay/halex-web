"""Staging catalog-pattern consultation for agency research tasks (H10 Archivist lane).

A deterministic, plain-data helper for staging drafts only. It is NOT
wired into the engine, and it adds a report field to a research task
listing the catalog patterns consulted for that task.

Rules enforced here:

- Every cited pattern carries the label "pattern, not a running agent".
- A pattern entry with no catalog id is refused with ValueError and
  is never cited. A refused entry produces no partial field.
- A cited pattern is described only by its catalog id, name, and
  category, plus the label above. No pattern is described as
  carrying out work, making choices, or producing effects.
- Output is a plain dict. This module performs no outside calls,
  no dynamic code, and no file access. Inputs are never mutated.

A research task is a plain dict: {"id", "topic", "question"}.
A pattern entry is a plain dict: {"catalog_id", "name", "category"}.
"""

PATTERN_LABEL = "pattern, not a running agent"


def _non_empty_string(value):
    return isinstance(value, str) and bool(value.strip())


def build_report_field(task, patterns):
    """Return the catalog-pattern report field for one research task.

    Raises ValueError if the task lacks id, topic, or question, or if
    any pattern entry lacks a catalog id, a name, or a category.
    An empty pattern list yields an empty consulted list, never an
    invented pattern.
    """
    if not isinstance(task, dict):
        raise ValueError("task must be a dict")
    for field in ("id", "topic", "question"):
        if not _non_empty_string(task.get(field)):
            raise ValueError("task field %r must be a non-empty string" % field)
    if patterns is None:
        raise ValueError("patterns must be a list")
    if not isinstance(patterns, list):
        raise ValueError("patterns must be a list")
    consulted = []
    for entry in patterns:
        if not isinstance(entry, dict):
            raise ValueError("pattern entry must be a dict")
        if not _non_empty_string(entry.get("catalog_id")):
            raise ValueError("pattern entry refused: no catalog id")
        if not _non_empty_string(entry.get("name")):
            raise ValueError("pattern entry refused: no name")
        if not _non_empty_string(entry.get("category")):
            raise ValueError("pattern entry refused: no category")
        consulted.append({
            "catalog_id": entry["catalog_id"].strip(),
            "name": entry["name"].strip(),
            "category": entry["category"].strip(),
            "citation": PATTERN_LABEL,
        })
    return {
        "task_id": task["id"],
        "topic": task["topic"],
        "question": task["question"],
        "catalog_patterns_consulted": consulted,
        "pattern_count": len(consulted),
    }


def render_report_field(field):
    """Render a report field as plain text lines for language checks."""
    lines = [
        "Task: %s" % field["task_id"],
        "Topic: %s" % field["topic"],
        "Question: %s" % field["question"],
        "Catalog patterns consulted: %d" % field["pattern_count"],
    ]
    for entry in field["catalog_patterns_consulted"]:
        lines.append(
            "- %s (%s, %s) -- %s"
            % (entry["name"], entry["catalog_id"], entry["category"],
               entry["citation"])
        )
    return "\n".join(lines) + "\n"
