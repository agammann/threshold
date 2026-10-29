# Threshold research prototype

A local command-line experiment comparing a single supplied ground-level route against private, user-selected width, step and turning criteria. It prints missing-information questions and measurement provenance, not a universal accessibility badge. Requires Python 3.10+ and no dependencies.

    python threshold.py examples/route.json examples/criteria.json
    python -m unittest discover -s tests -v

Examples are fictional. Values are centimetres; width and turning space are minima, step is a maximum. Dates use ISO format. Output can be redirected to a file and printed. Personal criteria are read locally; do not commit them.

This is an alpha research prototype, not a survey, navigation tool, or safety guarantee. Data may be stale, inaccurate, or omit obstacles and other needs; confirm details with the venue before a visit. The prototype does not include an editor, IndexedDB, photo handling, or A11yJSON import/export; its input format is not A11yJSON. Co-design and validation with intended users are needed before further development.

[Wheelmap](https://github.com/sozialhelden/wheelmap-frontend) already provides place discovery. [A11yJSON](https://github.com/sozialhelden/a11yjson) already describes physical accessibility and should be studied before making an adapter. [AccessAble](https://www.accessable.co.uk/articles/free-training-in-slough-join-accessable-s-surveying-workshop) produces detailed surveyed guides, including [published measurements](https://www.accessable.co.uk/sunderland-city-council/access-guides/premier-inn-sunderland-a19-a1231). Threshold explores private comparisons and questions; similar tools may exist. Compare a synthetic card with an existing guide in participatory research before continuing.

## Browser prototype

Open `index.html` in a browser with JavaScript enabled. Enter a route and personal criteria; the visit card updates locally and can be printed. Entries last only for the current tab. Route JSON import/export uses the example format and excludes criteria. Only import trusted files: this is an experimental prototype. Date, source and photo descriptions are text; images are not stored or verified. Invalid or missing fields and dates over a year old require follow-up. A year is a simple flag, not a guarantee that newer information is accurate.

A11yJSON has door-specific width, threshold and turning-space fields. They cannot safely be treated as route-wide minima or maxima. No adapter is claimed until that semantic distinction and provenance can be represented and validated with intended users. The prototype has not undergone participatory or accessibility testing.

Web logic checks: `node --test tests/web.test.js` (Node 18+).
