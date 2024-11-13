const fs = require('fs');
const ytdl = require("@distube/ytdl-core");
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync('cache/')) {
  fs.mkdirSync('cache/');
}

async function getFormats(url) {
  const info = await getVideoInfo(url);
  if (info.error) return info;

  const formats = info.formats;

  return {
    video: formats.filter(e => e.fileType == 'VIDEO' && e.extension != 'DAT').map(e => [e.extension, e.quality, e.itag])
                .sort((a, b) => b[1].localeCompare(a[1]))
                .sort((a, b) => b[1].length - a[1].length)
                .sort((a, b) => a[0].localeCompare(b[0])),
    audio: formats.filter(e => e.fileType == 'AUDIO' && e.extension != 'DAT').map(e => [e.extension, e.quality, e.itag])
                .sort((a, b) => b[1].localeCompare(a[1]))
                .sort((a, b) => b[1].length - a[1].length)
                .sort((a, b) => a[0].localeCompare(b[0])),
    details: info.videoDetails
  };
}

async function getVideoInfo(url) {
  console.log(`Fetching ${url}...`);

  let output = undefined;

  let id;
  try {
    id = ytdl.getVideoID(url);
  } catch (e) {
    console.log('Invalid URL');
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
      formats: info.formats.sort((a, b) => b.itag - a.itag).filter((item, pos, ary) => {
        return pos == 0 || item.itag != ary[pos - 1].itag;
      }).map(e => {
        e.extension = getExtension(e).substring(1).toUpperCase();
        e.fileType = e.mimeType ? e.mimeType.substring(0, e.mimeType.indexOf('/')).toUpperCase() : 'UNKNOWN';
        e.quality = e.audioBitrate ? e.audioBitrate + ' bits/sec' : e.qualityLabel ? e.qualityLabel.toUpperCase() : 'UNKNOWN';
        return e;
      }),
      videoDetails: info.videoDetails
    };
  }).catch((e) => {
    console.log(e);
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

async function downloadVideo(id, itag) {
  console.log(`Starting download of id ${id} itag ${itag}.`);

  const info = await getVideoInfo(id);
  if (info.error) {
    return false;
  }

  const formats = info.formats.filter(e => e.itag == itag);
  if (formats.length < 1) {
    console.log('Not a valid format.');
    return false;
  }

  const format = formats[0];

  const fileExtension = getExtension(format);

  let done = false;
  ytdl(id, { quality: itag })
    .pipe(fs.createWriteStream('cache/' + id + '_' + itag + fileExtension))
    .on('close', () => done = true);
  
  while (!done) {
    await sleep(1000);
  }

  console.log(`Finished downloading id ${id} itag ${itag}.`);
  return true;
}

function getExtension(format) {
  let fileExtension = '.dat';

  if (!format.mimeType) return fileExtension;

  if (format.mimeType.startsWith('audio/mp4')) fileExtension = '.mp3';
  if (format.mimeType.startsWith('video/mp4')) fileExtension = '.mp4';
  if (format.mimeType.startsWith('video/webm') || format.mimeType.startsWith('audio/webm')) fileExtension = '.webm';

  return fileExtension;
}

module.exports = {
  getFormats,
  getVideoInfo,
  downloadVideo
};