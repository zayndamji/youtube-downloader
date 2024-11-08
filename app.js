const { getVideoInfo } = require('./youtube');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.get('/styles.css', (req, res) => {
  res.sendFile('styles.css', { root: __dirname });
});

app.get('/script.js', (req, res) => {
  res.sendFile('script.js', { root: __dirname });
});

app.get('/youtube/:id', async (req, res) => {
  console.log(req.params);
  const videoInfo = await getVideoInfo(req.params.id);

  res.type('json');
  res.send(videoInfo);
});

app.listen(9356);