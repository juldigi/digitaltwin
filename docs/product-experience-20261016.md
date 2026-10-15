# Product experience: search control cleanup

Base: `7714d98a40d7cfce58c97cefc9d6e264243d6bf6`. All three base workflows passed, including Cloudflare deployment.

Production DOM and screenshot inspection revealed nested input borders. The global search wrapper and its input each had a 1px border; the catalogue search label and input also each had a 1px border. Global label margins (15px top / 7px bottom) additionally leaked into both search compositions.

The final experience stylesheet now explicitly assigns the global-search border to its wrapper and catalogue borders to native input/select controls. Labels retain accessible association and lose only their decorative box and inherited margins. Filtering, machine identity and simulation behavior are unchanged. The latest Offset 5 progressive feeder-entry changes are retained.

Validation: 84 targeted UI/interaction/language tests PASS; build PASS; diff whitespace check PASS. Complete regression remains enforced by the existing deployment pipeline. Production visual verification: pending. No physical iPhone or visual WebGL certification is made.
