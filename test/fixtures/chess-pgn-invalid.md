# Malformed Block

This block is not valid chess:

```chess
this is not a chess position at all
```

Falls back to a code block.
````

Expected: the block renders as a plain `<pre><code>` block with the raw text visible. No crash.

---