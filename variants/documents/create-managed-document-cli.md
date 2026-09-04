---
id: create-managed-document-cli
capability: documents-profile
workflow: ../../workflows/documents/create-managed-document.md
surface: cli
summary: CLI reads exact local file content and accepts owner flags without a confirmation prompt.
aliases: [documents create, content-file]
requires: [../../workflows/documents/create-managed-document.md]
---

# Create managed content via CLI

## Exposure

`gig-finder documents create`.

## Inputs and validation

Requires type, media type, content file, and at least one valid owner flag (`--gigs`, `--people`, or `--profile`); optional title/description/source description.

## Interaction sequence

Read the complete resolved file, validate, create, print JSON.

## Outputs or presentation

Returns record metadata, changed, and change ID.

## Confirmation and authorization

Direct local invocation is authorization.

## Surface-specific failures

Unreadable path, invalid flags, owners, or content fail nonzero.

## Refresh and consistency

The file is read once at invocation; later filesystem edits do not change managed content.

## Known limitations

CLI-created file content does not automatically gain upload-converter provenance.

## Shared workflow

[Canonical behavior](../../workflows/documents/create-managed-document.md)
