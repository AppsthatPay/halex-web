# HALEX-AI Fauna Encyclopedia — design

Status: FOUNDATION ONLY. This is a growing intake program, NOT a complete
encyclopedia. Version 1 of the pack holds 5 verified species records.
Nothing in this document claims all species are covered, and no record
claims a fact its provenance does not support.

## Why this exists

Jeffrey asked why HALEX-AI stops at mice. The answer was structural,
not topical: the old animals pack was six short answers about one
animal, with no schema, no range data, no tracks, no subspecies, and
no conversation threads. This foundation replaces that shape with a
species record that can carry a conversation: identity, taxonomy,
appearance, tracks and sign, range, subspecies, behavior, diet,
conservation, and the follow-up threads each record can sustain.

## The species record schema

Every record is one JSON object in `pack_fauna_v1.json` (and later
pack versions). Field rules are enforced by `tests/test_fauna_pack.py`.

| Field | Type | Rule |
|---|---|---|
| `id` | string | Stable slug, e.g. `mus-musculus`. Never reused for another species. |
| `common_name` | string | The name people use. |
| `scientific_name` | string | Binomial as published. |
| `group` | string | One of: mammal, bird, fish, insect, reptile, amphibian. |
| `taxonomy` | object | kingdom, phylum, class, order, family, genus, species. Any rank not verified from a read source is exactly `NOT READ`, never guessed. |
| `appearance` | object | `summary` (free text), `size`, `weight`. Size/weight are strings as published (with units) or `NOT READ`. |
| `tracks_sign` | string | What the animal leaves behind: prints, scat, nests, redds, roosts, song. For animals that leave no tracks (fish, most insects) this field names the equivalent sign, or `NOT READ` if no sign was verified. |
| `range` | object | `regions`: list of region strings as published; `notes`: free text (native vs introduced, migration endpoints). |
| `habitat` | string | Habitats as published, or `NOT READ`. |
| `subspecies` | object | `status`: `listed` or `NOT READ`; `names`: list (empty unless verified); `note`: free text, e.g. "ADW notes the name covers several distinct kinds". |
| `behavior` | string | Activity, social life, movement, communication, or `NOT READ`. |
| `diet` | string | Foods as published, or `NOT READ`. |
| `reproduction` | string | Mating, gestation/incubation, litter/clutch, lifespan notes, or `NOT READ`. |
| `conservation_status` | string | An IUCN-style category ONLY when verified from a read source; otherwise `NOT READ`. |
| `conservation_note` | string | What a read source actually says about population trend or concern. |
| `conversation_hooks` | array | At least 3 hooks (see below). Each hook: `id`, `thread`, `prompt` (an example user question), `follow_ups` (2+ example follow-up questions). |
| `images` | object | `status`: always `NOT READ` until an image file's own license page has been read; `files`: always `[]` until then; `note`: the designated source pool (see Image rule). |
| `provenance` | array | At least 1 entry: `source`, `url`, `accessed` (date), `supports` (which fields this source backs). Every factual string in the record must trace to at least one provenance entry. |

## Conversation hooks: the difference between a page and a conversation

A readable page ends when the text ends. A record with hooks does not:
each hook is a thread the visitor can pull, and each follow-up is a
question the record can already answer from its own fields or from a
linked record. Example threads:

- `identify` — "is this what I saw?" (appearance + tracks_sign)
- `compare` — "how is it different from X?" (appearance + a second record)
- `tracks` — "what print/scat/song is this?" (tracks_sign)
- `range` — "does it live near me?" (range + habitat)
- `care` — pet or livestock-adjacent general information, always with
  a professional-referral note, never a diagnosis
- `pest` — exclusion and sanitation first, never poison advice where
  children or pets could reach it
- `migrate` — seasonal movement threads (monarch, salmon)
- `lookalike` — the species most often confused with this one

Hooks are the seed of the "fully engaged conversation" Jeffrey asked
for. The conversation-pattern note (`CONVERSATION-PATTERNS.md`)
explains how a chat layer routes a visitor's words onto these hooks.

## Image rule (non-negotiable)

No image file is referenced until its own license page has been read.
The designated source pool is Wikimedia Commons, public-domain or
CC BY / CC BY-SA files only, with attribution carried in the record.
Until then every record's `images.files` is `[]` and `images.status`
is `NOT READ`. A record with no verified image is still publishable;
a record with a claimed-but-unverified image is not.

## Source rule

Preferred sources, in order: Animal Diversity Web (University of
Michigan Museum of Zoology), BioKIDS (ADW's companion), university
extension services (e.g. Mississippi State Extension), government
species pages (e.g. Smithsonian, state DNR), then other published
reference works. A fact keeps the source that backs it; a secondary
summary that disagrees with a primary account is recorded as a
disagreement, not silently resolved. Outdated accounts (ADW pages are
often 1990s–2000s) are cited with their date context where it
matters, e.g. conservation assessments.

## Intake program

The pack grows by group, driven by queue entries (see
`workspace/allen/halex-ai-selfbuild/queue/fauna-intake-*.json`).
Each intake run:

1. Picks the next group queue entry.
2. Reads ADW or equivalent accounts for 3–10 new species.
3. Writes records in this schema, with provenance per record.
4. Runs the schema test suite; the pack version bumps only on green.
5. Leaves every unverified field as `NOT READ` — an intake run that
   invents a fact fails the gate, however many records it produces.

Current state (2026-10-30): 5 records — house mouse, red fox,
northern cardinal, Atlantic salmon, monarch butterfly. That is the
seed, not the encyclopedia. Reptiles and amphibians have zero records
so far; their queue entry exists and is pending.

## What this is NOT

- Not a field guide replacement: no record is a substitute for a
  regional guide, a veterinarian, a wildlife agency, or a
  conservation authority.
- Not a tracking manual: track sizes are given as published ranges
  for identification help, not as a guarantee for any single print.
- Not medical or veterinary advice: disease mentions (rabies,
  hantavirus risk from wild-mouse droppings in the older mice pack)
  are general information with a professional-referral note.
- Not connected to any live system: this pack is static JSON. It
  trades nothing, signs nothing, and touches no wallet, brain, or
  paper registry.
