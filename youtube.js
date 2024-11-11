const fs = require('fs');
const ytdl = require("@distube/ytdl-core");
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync('data/')) {
  fs.mkdirSync('data/');
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

  ytdl.getInfo(id).then(info => {
    console.log(info.videoDetails.videoId);
    output = info;
  }).catch(() => {
    console.log('Invalid Video ID');
    output = {
      error: 'Invalid Video ID'
    }
  });

  while (!output) {
    await sleep(1000);
  }
  console.log(`Fetched ${url}`);

  return output;
}

module.exports = {
  getVideoInfo
};