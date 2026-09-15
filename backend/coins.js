const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/markets', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coin data' });
  }
});

module.exports = router;