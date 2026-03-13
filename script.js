const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc';
const CHANNEL_ID = 'UCV1haSg1f6u8wfwuAsCJR_A';

async function getVideos() {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`);
        const data = await res.json();
        const grid = document.getElementById('video-grid');
        grid.innerHTML = '';

        data.items.forEach(video => {
            const html = `
                <div class="video-card">
                    <img src="${video.snippet.thumbnails.high.url}">
                    <div class="video-info">
                        <h3>${video.snippet.title}</h3>
                        <button class="btn-read" onclick="this.nextElementSibling.style.display='block'">Devamını Oku</button>
                        <div class="desc">
                            ${video.snippet.description}
                            <br><br>
                            <a href="https://youtube.com/watch?v=${video.id.videoId}" target="_blank">YouTube'da İzle</a>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += html;
        });
    } catch (err) {
        console.error("Hata:", err);
    }
}
getVideos();
