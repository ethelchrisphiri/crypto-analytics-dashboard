const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

const cache = new NodeCache({ stdTTL: 300 }); 

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `history-${id}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: 7,
        },
      }
    );

    const formatted = response.data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price,
    }));

    cache.set(cacheKey, formatted);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coin history' });
  }
});

module.exports = router;
