# Apply the flexoki palette to ZINIUM report rendering

status: open

## What
When ZINIUM knowledge or self-review reports are rendered as HTML or
styled documents, offer the flexoki palette (workspace/resources/flexoki/)
as the reading-surface theme: its warm paper-and-ink ramps for prose and
code in long-form reports. Reading/report surfaces only — the HALEX brand
palette (black onyx, gold, teal) governs product surfaces and is not
changed by this item.

## Which resource
kepano/flexoki (MIT, © Steph Ango), vendored at
workspace/resources/flexoki/ (css/flexoki.css + NOTICE).

## Acceptance test idea
A sample ZINIUM report rendered with the flexoki theme uses only color
values present in the vendored flexoki.css (checked mechanically against
the file), and the same report rendered with the brand theme is unchanged.
