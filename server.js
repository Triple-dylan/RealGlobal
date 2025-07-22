const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 4000;

// Proxy endpoint for World Bank GDP Growth data
app.get('/api/worldbank/gdp-growth', async (req, res) => {
  try {
    // Example: World Bank API for GDP growth (annual %)
    // https://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.KD.ZG?downloadformat=csv
    // We'll use the JSON API for easier parsing
    const url = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=300&date=2022';
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch World Bank data' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
}); 