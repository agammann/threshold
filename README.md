# Threshold

Threshold compares measurements for one supplied ground-level route with your own width, step and turning criteria. It records measurement sources, flags dates that need checking and suggests questions for a visit. The browser runs locally with JavaScript enabled. The CLI requires Python 3.10 or newer and uses the standard library.

## Command line

    python threshold.py examples/route.json examples/criteria.json
    python -m unittest discover -s tests -v

Run the commands from this directory. The examples are fictional. Enter values in centimetres. Width and turning space are minimums. Step height is a maximum. Use calendar dates in `YYYY-MM-DD` format. The CLI keeps recorded measurements and provenance visible when a criterion is blank. Redirect the output to a text file if you want to print it. Keep personal criteria files private.

## Browser

1. Open `index.html` in a browser with JavaScript enabled. Enter measurements or import the fictional `examples/route.json`.
2. Enter any personal criteria and inspect **Your visit card**. Leave unknown measurements blank. Follow up on missing, invalid, future and old measurement details. Measurements older than 365 days get an update prompt.
3. Use **Export route JSON** to save the route only. The browser keeps criteria in memory for the current tab. **Print visit card** includes the displayed comparisons and can expose the criteria you entered.

Use trusted route files. The route template contains text for the name, measurement dates and sources. The editor stores no photos or persistent browser database. Export a route you want to reopen later.

Web logic checks use `node --test tests/web.test.js` with Node.js 18 or newer.

## Scope

Measurements may be stale, inaccurate or omit obstacles and other needs. Confirm details with the venue before a visit and use the card as a planning aid. It compares a supplied route and carries no universal accessibility badge or safety guarantee. Threshold uses its own route JSON format. A11yJSON door-specific measurements require separate mapping and validation before being used as route-wide measurements. Participatory and accessibility validation with intended users remain outstanding.

[Wheelmap](https://github.com/sozialhelden/wheelmap-frontend) already provides place discovery. [A11yJSON](https://github.com/sozialhelden/a11yjson) already describes physical accessibility and should be studied before making an adapter. [AccessAble](https://www.accessable.co.uk/articles/free-training-in-slough-join-accessable-s-surveying-workshop) produces detailed surveyed guides, including [published measurements](https://www.accessable.co.uk/sunderland-city-council/access-guides/premier-inn-sunderland-a19-a1231). Threshold explores private comparisons and questions; similar tools may exist. Compare a synthetic card with an existing guide in participatory research before continuing.
