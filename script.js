document.getElementById('url-submit').addEventListener('click', getVideoInfo);

async function getVideoInfo() {
  document.getElementById('title').textContent = 'Loading...';
  document.getElementById('channel').textContent = '';

  document.getElementById('views').textContent = '';
  document.getElementById('likes').textContent = '';

  document.getElementById('thumbnail').src = '';
  document.getElementById('thumbnail').classList.remove('active');

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
    document.getElementById('title').textContent = 'An error occured. Please try again.';
    return;
  }

  const { formats, videoDetails } = json;

  document.getElementById('title').textContent = videoDetails.title;
  document.getElementById('channel').textContent = videoDetails.author.user;

  document.getElementById('views').innerHTML = `Views: <strong>${videoDetails.viewCount}</strong>`;
  document.getElementById('likes').innerHTML = `Likes: <strong>${videoDetails.likes}</strong>`;

  document.getElementById('thumbnail').src = videoDetails.thumbnails.slice(-1)[0].url;
  document.getElementById('thumbnail').classList.add('active');
}