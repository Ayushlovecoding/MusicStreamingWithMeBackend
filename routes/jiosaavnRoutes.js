const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const BASE =
  (process.env.JIOSAAVN_BASE_URL || 'https://jiosavan-api2.vercel.app')
    .replace(/\/+$/, ''); // remove trailing slash safely

// axios instance
const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

/**
 * Try multiple endpoint shapes to survive API changes
 */
async function proxyGet(paths = [], params = {}) {
  let lastError;

  for (const path of paths) {
    try {
      const res = await client.get(path, { params });
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

/* ---------------- SEARCH ---------------- */

router.get('/search', async (req, res) => {
  const q = req.query.query || req.query.q;
  if (!q) return res.status(400).json({ message: 'query required' });

  try {
    const resp = await proxyGet(
      ['/api/search', '/search'],
      { query: q, q }
    );
    res.json(resp.data);
  } catch (err) {
    res.status(502).json({ message: 'search failed' });
  }
});

router.get('/search/songs', async (req, res) => {
  const q = req.query.query || req.query.q;
  if (!q) return res.status(400).json({ message: 'query required' });

  try {
    const resp = await proxyGet(
      ['/api/search/songs', '/search/songs', '/search'],
      { query: q, q, page: req.query.page, limit: req.query.limit }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'search songs failed' });
  }
});

router.get('/search/albums', async (req, res) => {
  const q = req.query.query || req.query.q;
  if (!q) return res.status(400).json({ message: 'query required' });

  try {
    const resp = await proxyGet(
      ['/api/search/albums', '/search/albums', '/search'],
      { query: q, q, page: req.query.page, limit: req.query.limit }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'search albums failed' });
  }
});

router.get('/search/artists', async (req, res) => {
  const q = req.query.query || req.query.q;
  if (!q) return res.status(400).json({ message: 'query required' });

  try {
    const resp = await proxyGet(
      ['/api/search/artists', '/search/artists', '/search'],
      { query: q, q, page: req.query.page, limit: req.query.limit }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'search artists failed' });
  }
});

router.get('/search/playlists', async (req, res) => {
  const q = req.query.query || req.query.q;
  if (!q) return res.status(400).json({ message: 'query required' });

  try {
    const resp = await proxyGet(
      ['/api/search/playlists', '/search/playlists', '/search'],
      { query: q, q, page: req.query.page, limit: req.query.limit }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'search playlists failed' });
  }
});

/* ---------------- SONGS ---------------- */

router.get('/songs', async (req, res) => {
  try {
    const resp = await proxyGet(
      ['/api/songs', '/songs'],
      req.query
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'songs failed' });
  }
});

router.get('/songs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resp = await proxyGet(
      ['/api/songs/' + id, '/songs/' + id, '/song', '/api/song'],
      { id }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'song fetch failed' });
  }
});

router.get('/songs/:id/suggestions', async (req, res) => {
  const { id } = req.params;

  try {
    const resp = await proxyGet(
      [
        `/api/songs/${id}/suggestions`,
        `/songs/${id}/suggestions`
      ]
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'song suggestions failed' });
  }
});

/* ---------------- ALBUMS ---------------- */

router.get('/albums', async (req, res) => {
  try {
    const resp = await proxyGet(
      ['/api/albums', '/albums'],
      req.query
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'albums failed' });
  }
});

router.get('/albums/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resp = await proxyGet(
      ['/api/albums/' + id, '/albums/' + id, '/album', '/api/album'],
      { id }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'album fetch failed' });
  }
});

/* ---------------- ARTISTS ---------------- */

router.get('/artists', async (req, res) => {
  try {
    const resp = await proxyGet(
      ['/api/artists', '/artists'],
      req.query
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'artists failed' });
  }
});

router.get('/artists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resp = await proxyGet(
      ['/api/artists/' + id, '/artists/' + id, '/artist', '/api/artist'],
      { id }
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'artist fetch failed' });
  }
});

router.get('/artists/:id/songs', async (req, res) => {
  const { id } = req.params;

  try {
    const resp = await proxyGet(
      ['/api/artists/' + id + '/songs', '/artists/' + id + '/songs'],
      req.query
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'artist songs failed' });
  }
});

router.get('/artists/:id/albums', async (req, res) => {
  const { id } = req.params;

  try {
    const resp = await proxyGet(
      ['/api/artists/' + id + '/albums', '/artists/' + id + '/albums'],
      req.query
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'artist albums failed' });
  }
});

/* ---------------- PLAYLISTS ---------------- */

router.get('/playlists', async (req, res) => {
  try {
    const resp = await proxyGet(
      ['/api/playlists', '/playlists'],
      req.query
    );
    res.json(resp.data);
  } catch {
    res.status(502).json({ message: 'playlists failed' });
  }
});

/* ---------------- STREAM ---------------- */

router.get('/stream', async (req, res) => {
  const encoded = req.query.url;
  if (!encoded) return res.status(400).json({ message: 'url required' });

  let remote;
  try {
    remote = decodeURIComponent(encoded);
  } catch {
    return res.status(400).json({ message: 'invalid url' });
  }

  if (!/^https?:\/\//i.test(remote))
    return res.status(400).json({ message: 'invalid protocol' });

  try {
    const upstream = await axios.get(remote, {
      responseType: 'stream',
      timeout: 15000,
      headers: { 'User-Agent': 'MusicWithMe/1.0' },
    });

    res.setHeader(
      'Content-Type',
      upstream.headers['content-type'] || 'audio/mpeg'
    );

    upstream.data.pipe(res);
  } catch {
    res.status(502).json({ message: 'stream failed' });
  }
});

module.exports = router;
