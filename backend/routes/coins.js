const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

const cache = new NodeCache({ stdTTL: 60 }); 

router.get('/markets', async (req, res) => {
  const cacheKey = 'markets';
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
      },
    });

    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coin data' });
  }
});

module.exports = router;