const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to meta data scrapper</h1>
    <p>Send us request at <a href="/fetch-metadata">/fetch-metadata</a> with ( url for which metadata needs to be fetched in the body )</p>
    <hr/>
    <h2>We will get back to you as soon as possible</h2>
    `);
})

app.post('/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content') || url,
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    if (error instanceof axios.AxiosError)
      res.status(500).json({ error: 'failed to get metadata' });
    else
      res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
