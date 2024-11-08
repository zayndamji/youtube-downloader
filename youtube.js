const fs = require('fs');
const ytdl = require("@distube/ytdl-core");
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync('data/')) {
  fs.mkdirSync('data/');
}

async function getVideoInfo(url) {
  console.log(`Fetching ${url}...`);

  let output = undefined;
  ytdl.getInfo(url).then(info => {
    console.log(info.videoDetails.videoId);
    output = info;
  }).catch(() => {
    console.log('An error occurred.');
    output = {
      error: 'An error occured.'
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