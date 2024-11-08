const fs = require('fs');
const util = require('util');
const youtubedl = require('youtube-dl-exec');

if (!fs.existsSync('data/')) {
  fs.mkdirSync('data/');
}

async function getVideoInfo(id) {
  if (fs.existsSync(`data/${id}.json`)) {
    console.log(`${id} has already been fetched.`);
    return JSON.parse(fs.readFileSync(`data/${id}.json`));
  }
  
  console.log(`Fetching ${id}...`);
  const output = JSON.parse((await youtubedl.exec('https://youtube.com/watch?v=' + id, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
  })).stdout);

  fs.writeFileSync(`data/${output.id}.json`, JSON.stringify(output, undefined, 2));
  console.log(`${output.id} has been fetched!`);
  return output;
}

module.exports = {
  getVideoInfo
};