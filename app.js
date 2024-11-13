const { getFormats, downloadVideoFromFormat } = require('./youtube');

const fs = require('fs');

const express = require('express');
const app = express();
app.use(clearStaleCache);
app.use('/cache', express.static('cache'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.get('/styles.css', (req, res) => {
  res.sendFile('styles.css', { root: __dirname });
});

app.get('/script.js', (req, res) => {
  res.sendFile('script.js', { root: __dirname });
});

app.get('/favicon.png', (req, res) => {
  res.sendFile('favicon.png', { root: __dirname });
});

app.post('/youtube', async (req, res) => {
  res.type('json');

  console.log(req.body);
  if (!req.body.url) {
    res.send({});
    return;
  }

  const videoInfo = await getFormats(req.body.url);

  if (!videoInfo.error) {
    res.send(videoInfo);
  } else {
    res.send({
      error: videoInfo.error
    });
  }
});

app.post('/download', async (req, res) => {
  console.log(req.body);
  if (!req.body.extension || !req.body.videoQuality || !req.body.audioQuality || !req.body.id) {
    res.end();
    return;
  }

  const filepaths = await downloadVideoFromFormat(req.body.id, req.body.extension, req.body.videoQuality, req.body.audioQuality);
  console.log(filepaths);
  res.send(filepaths);
});

app.listen(9356, () => {
  console.log('Server opened on http://localhost:9356');
});

const cacheRefreshTimeHours = 2;
const cacheRefreshTimeMs = 1000 * 60 * 60 * cacheRefreshTimeHours;

function clearStaleCache(req, res, next) {
  const cache = fs.readdirSync('cache/').filter(e => e != '.DS_Store');
  for (const file of cache) {
    const stat = fs.statSync('cache/' + file);

    const currentTime = (new Date()).getTime();
    const fileTime = stat.mtime.getTime();
    const diff = currentTime - fileTime;

    if (diff > cacheRefreshTimeMs) {
      console.log(`${file} is ${diff} ms old.`);
      fs.rmSync('cache/' + file);
      console.log(`${file} has been removed.`);
    }
  }

  next();
}