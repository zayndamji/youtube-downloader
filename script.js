document.getElementById('url-submit').addEventListener('click', getVideoInfo);

document.getElementById('downloadVideo').addEventListener('click', async () => {
  const id = document.getElementById('youtube-video-container').getAttribute('youtube-id');
  const extension = document.getElementById('extension').value;
  const videoQuality = document.getElementById('videoQuality').value;
  const audioQuality = document.getElementById('audioQuality').value;

  console.log(id, extension, videoQuality, audioQuality);

  const res = await fetch('/download', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, extension, videoQuality, audioQuality })
  });
  const json = await res.json();

  console.log(json);

  if (json.error) {
    console.error(json.error);
    return;
  }

  downloadFile(json.filePath, document.getElementById('title').textContent);
});

resetVideoDetails();

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

  document.getElementById('youtube-video-container').setAttribute('youtube-id', details.videoId);

  document.getElementById('title').textContent = details.title;
  document.getElementById('channel').textContent = details.ownerChannelName;

  document.getElementById('views').innerHTML = `Views: <strong>${formatNumber(details.viewCount)}</strong>`;
  document.getElementById('likes').innerHTML = `Likes: <strong>${formatNumber(details.likes)}</strong>`;
  
  document.getElementById('duration').innerHTML = `Duration: <strong>${formatDuration(details.lengthSeconds)}</strong>`;

  document.getElementById('thumbnail').src = details.thumbnails.slice(-1)[0].url;
  document.getElementById('thumbnail').classList.add('active');

  const extensions = Array.from(new Set(video.map(e => e[0])));
  console.log(extensions);

  for (const extension of extensions) {
    const option = document.createElement('option');
    option.value = extension;
    option.textContent = extension;
    document.getElementById('extension').append(option);
  }

  // remove event listeners
  document.getElementById('extension').parentNode.replaceChild(
    document.getElementById('extension').cloneNode(true),
    document.getElementById('extension')
  );

  document.getElementById('extension').addEventListener('change', () => renderQualities(video, audio));
  renderQualities(video, audio);

  document.getElementById('format-display').style.display = 'block';
  
  console.log(video, audio);
}

function renderQualities(video, audio) {
  if (document.getElementById('extension').value == '') return;

  document.getElementById('videoQuality').textContent = '';
  document.getElementById('audioQuality').textContent = '';

  for (const [_, quality] of video.filter(e => e[0] == document.getElementById('extension').value)) {
    const option = document.createElement('option');
    option.value = quality;
    option.textContent = quality;
    document.getElementById('videoQuality').append(option);
  }

  for (const [_, quality] of audio.filter(e => e[0] == document.getElementById('extension').value)) {
    const option = document.createElement('option');
    option.value = quality;
    option.textContent = quality;
    document.getElementById('audioQuality').append(option);
  }
}

function resetVideoDetails() {
  document.getElementById('title').textContent = 'Please enter a YouTube URL or ID above.';
  document.getElementById('channel').textContent = '';

  document.getElementById('views').textContent = '';
  document.getElementById('likes').textContent = '';

  document.getElementById('duration').innerHTML = '';

  document.getElementById('thumbnail').src = '';
  document.getElementById('thumbnail').classList.remove('active');

  document.getElementById('format-display').style.display = 'none';
  document.getElementById('extension').textContent = '';
  document.getElementById('videoQuality').textContent = '';
  document.getElementById('audioQuality').textContent = '';
}

function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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