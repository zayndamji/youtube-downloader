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

  for (const format of formats) {
    const formatDisplay = document.createElement('div');
    document.getElementById('youtube-format-list').append(formatDisplay);
  }
}

function resetVideoDetails() {
  document.getElementById('title').textContent = '';
  document.getElementById('channel').textContent = '';

  document.getElementById('views').textContent = '';
  document.getElementById('likes').textContent = '';

  document.getElementById('duration').innerHTML = '';

  document.getElementById('thumbnail').src = '';
  document.getElementById('thumbnail').classList.remove('active');
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