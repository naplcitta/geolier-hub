# Geolier Hub

An azzurro, Napoli-coded fan app for ranking every Geolier song, grading every album and playing Geolier games. It installs on iPhone from Safari and works offline.

## Install on iPhone

1. Open the app's GitHub Pages link in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open Geolier Hub from your home screen.

## What's inside

- **Catalogue**: all four albums with their deluxe editions (Emanuele: Marchio registrato, and Atto II of Il coraggio dei bambini, Dio lo sa and Tutto è possibile), plus his standalone singles. 109 songs, with deluxe-only tracks tagged and a Deluxe or Standard view on every album.
- **Rank**: Head to Head battles that finalize your full ranking, an album ranking built from your song positions, and a drag-to-edit full list.
- **Play**: 11 games plus a Daily Challenge. Name That Tune with real previews, Tune Survival, Cover Zoom (deluxe covers included), Trivia, Parla Napulitano (Neapolitan words with English and Italian), Speed Round, Behind the Boards, Higher or Lower on Spotify streams, Odd One Out, Fill the Title and Timeline.
- **Library**: ratings, letter grades, previews, lanes by collaborator, milestones, stream counts, writing and production credits, and a detail sheet for every song.
- **The Circle**: La Famiglia, Il Suono, Napoli and his collaborators, from Luchè and SLF to Dat Boi Dee, Poison Beatz and Pino Daniele.
- **Me**: levels from Scugnizzo to El Pibe de Oro, badges, stats, Spotify connection and backups.

## Sharing with friends

Anyone can use it from the link. There's no sign-up and no server: each person's data lives on their own phone. Share your top 10 as an image, send a compare link with your top 25, or challenge a friend to the exact same game.

## Connecting Spotify

1. At developer.spotify.com, create an app, add this app's GitHub Pages address as a Redirect URI and tick **Web API**.
2. Put the Client ID in `js/config.js` as `spotifyClientId`, or paste it under **Me → Spotify**.
3. Add friends' Spotify emails under **User Management**. Spotify allows up to 5 per personal app, and the owner needs Premium.

## Data

Tracklists, cover art and audio previews come from Apple's iTunes catalogue and are streamed from Apple. Spotify stream counts are from kworb.net. Writing and production credits are from Italian and English Wikipedia. Chart facts are from FIMI reporting and Italian press. An unofficial fan project, not affiliated with Geolier, his labels or SSC Napoli.

## Running it locally

```bash
python3 -m http.server 8000
```
