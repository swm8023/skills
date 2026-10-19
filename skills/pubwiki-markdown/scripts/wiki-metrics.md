# Reader verification

Run the focused Node tests from the maintained Skills repository:

```text
node --test skills/pubwiki-markdown/tests/*.test.mjs
```

Use scripts/preview-reader.mjs for a local static export. Compare the same Vault
and browser viewport when measuring exported size, first load, DOM nodes and
search response time. Preview output stays in wiki/.previews and is not uploaded.
Verify no requests reach a DocHub API, MCP service or external CDN.
