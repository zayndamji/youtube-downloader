document.getElementById('url-submit').addEventListener('click', getVideoInfo);

async function getVideoInfo() {
  resetVideoDetails();
  document.getElementById('title').textContent = 'Loading...';

  const url = document.getElementById('url-input').value;
  console.log(url);

  const res = await fetch('/youtube', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  });
  const json = await res.json();

  console.log(json);

  if (json.error) {
    resetVideoDetails();
    document.getElementById('title').textContent = json.error;
    return;
  }

  const { formats, videoDetails } = json;

  document.getElementById('title').textContent = videoDetails.title;
  document.getElementById('channel').textContent = videoDetails.ownerChannelName;

  document.getElementById('views').innerHTML = `Views: <strong>${formatNumber(videoDetails.viewCount)}</strong>`;
  document.getElementById('likes').innerHTML = `Likes: <strong>${formatNumber(videoDetails.likes)}</strong>`;
  
  document.getElementById('duration').innerHTML = `Duration: <strong>${formatDuration(videoDetails.lengthSeconds)}</strong>`;

  document.getElementById('thumbnail').src = videoDetails.thumbnails.slice(-1)[0].url;
  document.getElementById('thumbnail').classList.add('active');

  const videoFormats = formats.filter(format => format.mimeType && (format.mimeType.startsWith('video/mp4') || format.mimeType.startsWith('video/webm')))
                              .map(e => {
                                e.extension = getExtension(e).substring(1).toUpperCase();
                                e.fileType = e.mimeType.substring(0, e.mimeType.indexOf('/')).toUpperCase();
                                e.quality = e.qualityLabel.toUpperCase();
                                return e;
                              })
                              .sort((a, b) => a.quality.localeCompare(b.quality))
                              .sort((a, b) => a.extension.localeCompare(b.extension));
  
  for (const format of videoFormats) {
    const formatDisplay = document.createElement('div');

    const extension = document.createElement('span');
    extension.textContent = format.extension;
    formatDisplay.append(extension);

    const quality = document.createElement('span');
    quality.textContent = format.quality;
    formatDisplay.append(quality);

    document.getElementById('video-formats').append(formatDisplay);
  }

  const audioFormats = formats.filter(format => format.mimeType && (format.mimeType.startsWith('audio/mp4') || format.mimeType.startsWith('audio/webm')))
                              .map(e => {
                                e.extension = getExtension(e).substring(1).toUpperCase();
                                e.fileType = e.mimeType.substring(0, e.mimeType.indexOf('/')).toUpperCase();
                                e.quality = e.audioBitrate + ' bits/sec';
                                return e;
                              })
                              .sort((a, b) => b.audioBitrate - a.audioBitrate)
                              .sort((a, b) => a.extension.localeCompare(b.extension));

  for (const format of audioFormats) {
    const formatDisplay = document.createElement('div');

    const extension = document.createElement('span');
    extension.textContent = format.extension;
    formatDisplay.append(extension);

    const quality = document.createElement('span');
    quality.textContent = format.quality;
    formatDisplay.append(quality);

    document.getElementById('audio-formats').append(formatDisplay);
  }
  
  console.log(videoFormats, audioFormats);
}

function resetVideoDetails() {
  document.getElementById('title').textContent = '';
  document.getElementById('channel').textContent = '';

  document.getElementById('views').textContent = '';
  document.getElementById('likes').textContent = '';

  document.getElementById('duration').innerHTML = '';

  document.getElementById('thumbnail').src = '';
  document.getElementById('thumbnail').classList.remove('active');

  document.getElementById('video-formats').textContent = '';
  document.getElementById('audio-formats').textContent = '';
}

function getExtension(format) {
  let fileExtension = '';

  if (format.mimeType.startsWith('audio/mp4')) fileExtension = '.mp3';
  if (format.mimeType.startsWith('video/mp4')) fileExtension = '.mp4';
  if (format.mimeType.startsWith('video/webm') || format.mimeType.startsWith('audio/webm')) fileExtension = '.webm';

  return fileExtension;
}

function formatDuration(time) {
  var sec_num = parseInt(time, 10);

  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours + ':' + minutes + ':' + seconds;
}

function formatNumber(number) {
  return (new Intl.NumberFormat()).format(number);
}