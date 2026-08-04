# 🛡️ PROJECT RULES: FILE SAFETY & SPOKEN VOICEOVER TONE

## 1. FILE EDITING SAFETY & USER PRESERVATION RULES
* **ALWAYS USE `replace_file_content`**:
  For all existing project documents, screenplays, shooting scripts, and methodology files, NEVER use full-file overwrite (`write_to_file` with Overwrite: true). Always use targeted chunk edits via `replace_file_content` or `multi_replace_file_content`.
* **ALWAYS READ FILE FIRST BEFORE EDITING**:
  Always execute `view_file` on the target file immediately before applying any edit to inspect and preserve any recent manual changes written by the user.
* **PRESERVE ALL USER CONTENT & STRUCTURE**:
  Never shorten, truncate, or delete existing blocks, legends, historical facts, or user notes unless explicitly instructed by the user.

## 2. SPOKEN VOICEOVER & NARRATIVE TONE RULES
* **CONVERSATIONAL REASONING OVER DRY LISTS OF NUMBERS**:
  Spoken text for teleprompter/recording must be smooth, conversational, and natural to read out loud on camera. Avoid long dry lists of exact dates or numbers in spoken text; phrase dates naturally into historical eras (e.g. *«ещё две с половиной тысячи лет назад...»*, *«четыреста лет назад...»*, *«в конце девятнадцатого века...»*). (Keep exact archival dates in the written reference bullet points for reference).
