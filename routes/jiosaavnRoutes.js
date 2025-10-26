const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const BASE = process.env.JIOSAAVN_BASE_URL || 'https://api-jio-saavan.vercel.app';

// Helper that tries /api/* first then falls back to /*
async function proxyGet(pathCandidates = [], params = {}) {
  let lastErr = null;
  for (const p of pathCandidates) {
    const url = `${BASE}${p}`;
    try {
      const resp = await axios.get(url, { params });
      return resp;
    } catch (err) {
      lastErr = err;
      // continue to next candidate
    }
  }
  // throw last error if all failed
  throw lastErr || new Error('No path candidates provided');
}

// Global search: /api/jiosaavn/search?query=...
router.get('/search', async (req, res) => {
  const q = req.query.query || req.query.q || '';
  if (!q) return res.status(400).json({ message: 'query param required' });
  try {
    const resp = await proxyGet([`/api/search`, `/search`], { query: q });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] global search error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn search failed', error: err && err.message });
  }
});

// Search categories
router.get('/search/songs', async (req, res) => {
  const q = req.query.query || req.query.q || '';
  const page = req.query.page; const limit = req.query.limit;
  if (!q) return res.status(400).json({ message: 'query param required' });
  try {
    const resp = await proxyGet([`/api/search/songs`, `/search/songs`, `/api/search`], { query: q, page, limit });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] search songs error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn search songs failed', error: err && err.message });
  }
});

router.get('/search/albums', async (req, res) => {
  const q = req.query.query || req.query.q || '';
  const page = req.query.page; const limit = req.query.limit;
  if (!q) return res.status(400).json({ message: 'query param required' });
  try {
    const resp = await proxyGet([`/api/search/albums`, `/search/albums`, `/api/search`], { query: q, page, limit });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] search albums error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn search albums failed', error: err && err.message });
  }
});

router.get('/search/artists', async (req, res) => {
  const q = req.query.query || req.query.q || '';
  const page = req.query.page; const limit = req.query.limit;
  if (!q) return res.status(400).json({ message: 'query param required' });
  try {
    const resp = await proxyGet([`/api/search/artists`, `/search/artists`, `/api/search`], { query: q, page, limit });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] search artists error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn search artists failed', error: err && err.message });
  }
});

router.get('/search/playlists', async (req, res) => {
  const q = req.query.query || req.query.q || '';
  const page = req.query.page; const limit = req.query.limit;
  if (!q) return res.status(400).json({ message: 'query param required' });
  try {
    const resp = await proxyGet([`/api/search/playlists`, `/search/playlists`, `/api/search`], { query: q, page, limit });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] search playlists error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn search playlists failed', error: err && err.message });
  }
});

// Generic songs listing or search: /api/jiosaavn/songs
router.get('/songs', async (req, res) => {
  try {
    const resp = await proxyGet([`/api/songs`, `/songs`], req.query);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] songs list error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn songs failed', error: err && err.message });
  }
});

// GET /api/jiosaavn/songs/:id and suggestions
router.get('/songs/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'id required' });
  try {
    // try a few shapes
    let resp;
    try {
      resp = await proxyGet([`/api/songs/${id}`, `/api/song`, `/songs/${id}`, `/song`], { id });
    } catch (inner) {
      // last attempt: /api/songs?id=
      resp = await axios.get(`${BASE}/api/songs`, { params: { id } });
    }
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] song fetch error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn fetch failed', error: err && err.message });
  }
});

router.get('/songs/:id/suggestions', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'id required' });
  try {
    const resp = await proxyGet([`/api/songs/${id}/suggestions`, `/songs/${id}/suggestions`, `/api/songs/${id}/suggestions`]);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] song suggestions error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn suggestions failed', error: err && err.message });
  }
});

// Albums
router.get('/albums', async (req, res) => {
  try {
    const resp = await proxyGet([`/api/albums`, `/albums`], req.query);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] albums error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn albums failed', error: err && err.message });
  }
});

router.get('/albums/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'id required' });
  try {
    const resp = await proxyGet([`/api/albums/${id}`, `/albums/${id}`, `/api/album`, `/album`], { id });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] album fetch error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn album fetch failed', error: err && err.message });
  }
});

// Artists
router.get('/artists', async (req, res) => {
  try {
    const resp = await proxyGet([`/api/artists`, `/artists`], req.query);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] artists error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn artists failed', error: err && err.message });
  }
});

router.get('/artists/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'id required' });
  try {
    const resp = await proxyGet([`/api/artists/${id}`, `/artists/${id}`, `/api/artist`, `/artist`], { id });
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] artist fetch error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn artist fetch failed', error: err && err.message });
  }
});

router.get('/artists/:id/songs', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'id required' });
  try {
    const resp = await proxyGet([`/api/artists/${id}/songs`, `/artists/${id}/songs`], req.query);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] artist songs error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn artist songs failed', error: err && err.message });
  }
});

router.get('/artists/:id/albums', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'id required' });
  try {
    const resp = await proxyGet([`/api/artists/${id}/albums`, `/artists/${id}/albums`], req.query);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] artist albums error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn artist albums failed', error: err && err.message });
  }
});

// Playlists
router.get('/playlists', async (req, res) => {
  try {
    const resp = await proxyGet([`/api/playlists`, `/playlists`], req.query);
    return res.json(resp.data);
  } catch (err) {
    console.error('[JioSaavn] playlists error:', err && err.message);
    return res.status(502).json({ message: 'JioSaavn playlists failed', error: err && err.message });
  }
});

// Stream proxy endpoint to bypass browser CORS for remote audio files.
// Example: GET /api/jiosaavn/stream?url=<encoded_url>
router.get('/stream', async (req, res) => {
  const encoded = req.query.url;
  if (!encoded) return res.status(400).json({ message: 'url query param required (encoded)' });
  let remote;
  try {
    remote = decodeURIComponent(encoded);
  } catch (err) {
    return res.status(400).json({ message: 'invalid encoded url' });
  }

  // Basic validation: allow only http(s)
  if (!/^https?:\/\//i.test(remote)) return res.status(400).json({ message: 'only http/https urls are allowed' });

  try {
    // Request the remote resource as a stream and pipe it to the client.
    const upstream = await axios.get(remote, {
      responseType: 'stream',
      maxRedirects: 5,
      headers: {
        // Some servers expect a browser-like UA
        'User-Agent': 'MusicWithMe/1.0 (+https://example.com)'
      }
    });

    // Forward relevant headers
    const contentType = upstream.headers['content-type'] || 'application/octet-stream';
    const contentLength = upstream.headers['content-length'];
    const acceptRanges = upstream.headers['accept-ranges'];

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    // Stream pipe with error handling
    upstream.data.on('error', (err) => {
      console.error('[JioSaavn] upstream stream error:', err && err.message);
      try { res.end(); } catch (e) {}
    });
    upstream.data.pipe(res);
  } catch (err) {
    console.error('[JioSaavn] stream proxy error:', err && (err.message || err.toString()));
    // If axios received a non-2xx, include status
    const status = err.response?.status || 502;
    return res.status(status).json({ message: 'failed to fetch remote stream', error: err.message });
  }
});

module.exports = router;

