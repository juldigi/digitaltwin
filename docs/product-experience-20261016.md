# Product experience: search control cleanup

Base: `7714d98a40d7cfce58c97cefc9d6e264243d6bf6`. All three base workflows passed, including Cloudflare deployment.

Production DOM and screenshot inspection revealed nested input borders. The global search wrapper and its input each had a 1px border; the catalogue search label and input also each had a 1px border. Global label margins (15px top / 7px bottom) additionally leaked into both search compositions.

The final experience stylesheet now explicitly assigns the global-search border to its wrapper and catalogue borders to native input/select controls. Labels retain accessible association and lose only their decorative box and inherited margins. Filtering, machine identity and simulation behavior are unchanged. The latest Offset 5 progressive feeder-entry changes are retained.

Validation: 84 targeted UI/interaction/language tests PASS; build PASS; diff whitespace check PASS. Complete regression remains enforced by the existing deployment pipeline. Production visual verification: PASS for desktop search-control composition. Release fac6113d491e599ed35a4e14980d386af01daaac passed Digital Twin CI 38777115184, Verify frontend 38777115450 and Cloudflare deployment 38777115189. Browser loaded fingerprint 9cb4e58d382b4560. Global input border is 0px inside its single bordered wrapper; catalogue label border is 0px while its input retains 1px. Both label margins are 0px. Screenshot confirmed the cleaner filter row, and searching OFU-1 still returns exactly one machine. Initial reload retained the previous cached stylesheet; a subsequent normal reload loaded the new fingerprint. No physical iPhone or visual WebGL certification is made.
