document.getElementById('youtube-submit').addEventListener('click', getVideoInfo);

async function getVideoInfo() {
  document.getElementById('youtube-video-title').textContent = 'Loading...';
  document.getElementById('youtube-video-channel').textContent = '';
  
  document.getElementById('youtube-video-thumbnail').src = '';
  document.getElementById('youtube-video-thumbnail').classList.remove('active');

  const url = document.getElementById('youtube-input').value;
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
    document.getElementById('youtube-video-title').textContent = 'An error occured. Please try again.';
    return;
  }

  const { formats, videoDetails } = json;

  document.getElementById('youtube-video-title').textContent = videoDetails.title;
  document.getElementById('youtube-video-channel').textContent = videoDetails.ownerChannelName;

  document.getElementById('youtube-video-thumbnail').src = videoDetails.thumbnails.slice(-1)[0].url;
  document.getElementById('youtube-video-thumbnail').classList.add('active');
}