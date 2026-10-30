# Publish the zinium-skill for contributing agents

status: open

## What
Make workspace/zinium-skill/SKILL.md discoverable by contributing agents:
list it in the workspace README's skills section and in the HALEX-AI
workspace index, so any agent arriving to contribute finds the skill that
teaches it to operate ZINIUM (verify the chain, query, append
knowledge-only memories with provenance) before it writes anything. The
skill's format follows the Agent Skills pattern from
kepano/obsidian-skills (MIT).

## Which resource
kepano/obsidian-skills (MIT, © Steph Ango), vendored at
workspace/resources/obsidian-skills/ — pattern source; the zinium-skill
content is original to HALEX-AI.

## Acceptance test idea
A fresh reader (human or agent) starting from the workspace README can
reach zinium-skill/SKILL.md in at most two hops, and the skill file's
frontmatter (name, description) parses as valid Agent Skills YAML.
