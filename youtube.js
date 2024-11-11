const fs = require('fs');
const ytdl = require("@distube/ytdl-core");
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync('cache/')) {
  fs.mkdirSync('cache/');
}

async function getVideoInfo(url) {
  console.log(`Fetching ${url}...`);

  let output = undefined;

  let id;
  try {
    id = ytdl.getURLVideoID(url);
  } catch (e) {
    console.log('Invalid URL/Video ID.');
    return {
      error: 'Invalid URL'
    }
  }

  console.log(`Identified id ${id}.`);

  if (fs.existsSync('cache/' + id + '.json')) {
    return JSON.parse(fs.readFileSync('cache/' + id + '.json'));
  }

  ytdl.getInfo(id).then(info => {
    output = {
      formats: info.formats,
      videoDetails: info.videoDetails
    };
  }).catch(() => {
    console.log('Invalid Video ID');
    output = {
      error: 'Invalid Video ID'
    }
  });

  while (!output) {
    await sleep(1000);
  }
  console.log(`Fetched YouTube video ${id}.`);

  fs.writeFileSync('cache/' + id + '.json', JSON.stringify(output, undefined, 2));

  return output;
}

module.exports = {
  getVideoInfo
};