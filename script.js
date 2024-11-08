document.getElementById('youtube-submit').addEventListener('click', getVideoInfo);

async function getVideoInfo() {
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
}