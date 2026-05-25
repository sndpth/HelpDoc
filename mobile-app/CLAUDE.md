# LLM Wiki Schema & Agent Instructions

This repository is organized as a persistent, LLM-managed personal knowledge base. Follow these rules and workflows when interacting with the files.

## Directory Structure
- /raw/: Immutable folder for original sources (PDFs, text files, notes). The agent must never modify files in this directory.
- /raw/assets/: Media and attachments corresponding to raw documents.
- /wiki/: The compiled, persistent knowledge base consisting of interlinked markdown files managed by the LLM.
- /wiki/index.md: Content catalog/registry indexing all wiki files.
- /wiki/log.md: Chronological log tracking all ingests, queries, and maintenance.

## Agent Workflows

### 1. Ingesting Sources (Command: Ingest)
When a source is added to /raw/ and the user requests ingestion:
1. Read the source file.
2. Draft a concise summary page at /wiki/sources/<source-name-slug>.md highlighting key findings and metadata.
3. Update or create relevant entity/concept pages under /wiki/ and insert bidirectional links ([[link]]).
4. Update /wiki/index.md listing the new/modified pages.
5. Append a log entry to /wiki/log.md using the format: ## [YYYY-MM-DD] ingest | <Source Title>.

### 2. Answering Queries (Command: Query)
When the user asks questions:
1. Search /wiki/index.md first to locate relevant pages.
2. Read the target wiki pages to compile a synthesized answer (cite your sources).
3. For deep or complex syntheses (e.g. comparisons, concept maps), offer to write the result as a new permanent synthesis page under /wiki/syntheses/ so knowledge compounds.

### 3. Wiki Maintenance (Command: Lint)
Upon request, run a health check:
1. Find broken links or orphaned pages.
2. Identify contradictions or obsolete information superseded by newer ingests.
3. Suggest missing pages or gaps that require investigation.
