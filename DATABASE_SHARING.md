# Share Database Content (Verbs + Vocab)

Use seed scripts instead of sharing raw Mongo files. This is the cleanest way to share data via GitHub.

## What gets recreated

- Verbs
- Nouns
- Adjectives
- Sentences
- Redemittel
- Daily Life Curriculum topics

## One command after clone

From project root:

```bash
npm run seed:all
```

This will run all server seed scripts and populate MongoDB.

## Required setup before seeding

1. Start MongoDB locally (or via Docker).
2. Create `server/.env` from `server/.env.example`.
3. Ensure `MONGO_URI` points to the database you want to fill.

## Notes

- Seeds are safe to run multiple times (`seed.ts` uses upsert).
- `seed:daily-life` recreates Daily Life topics from the curriculum text file.
- Do not commit real `.env` files to GitHub.