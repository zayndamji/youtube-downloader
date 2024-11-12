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

  const { video, audio, details } = json;

  document.getElementById('title').textContent = details.title;
  document.getElementById('channel').textContent = details.ownerChannelName;

  document.getElementById('views').innerHTML = `Views: <strong>${formatNumber(details.viewCount)}</strong>`;
  document.getElementById('likes').innerHTML = `Likes: <strong>${formatNumber(details.likes)}</strong>`;
  
  document.getElementById('duration').innerHTML = `Duration: <strong>${formatDuration(details.lengthSeconds)}</strong>`;

  document.getElementById('thumbnail').src = details.thumbnails.slice(-1)[0].url;
  document.getElementById('thumbnail').classList.add('active');
  
  for (const format of video) {
    const formatDisplay = document.createElement('div');

    const extension = document.createElement('span');
    extension.textContent = format[0];
    formatDisplay.append(extension);

    const quality = document.createElement('span');
    quality.textContent = format[1];
    formatDisplay.append(quality);

    document.getElementById('video-formats').append(formatDisplay);
  }

  for (const format of audio) {
    const formatDisplay = document.createElement('div');

    const extension = document.createElement('span');
    extension.textContent = format[0];
    formatDisplay.append(extension);

    const quality = document.createElement('span');
    quality.textContent = format[1];
    formatDisplay.append(quality);

    document.getElementById('audio-formats').append(formatDisplay);
  }
  
  console.log(video, audio);
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