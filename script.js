const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc';
const CHANNEL_ID = 'UC_SENİN_KANAL_IDN';

async function fetchVideos() {
    const url = `https://www.googleapis.com/chart/v1/yt/channel/videos?part=snippet&channelId=${CHANNEL_ID}&maxResults=6&order=date&key=${API_KEY}`;
    
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6`);
        const data = await response.json();
        const videoGrid = document.getElementById('video-grid');
        videoGrid.innerHTML = '';

        data.items.forEach(item => {
            if(item.id.videoId) {
                const card = `
                    <div class="video-card">
                        <iframe src="https://www.youtube.com/embed/${item.id.videoId}" allowfullscreen></iframe>
                        <div class="video-info">
                            <h3>${item.snippet.title}</h3>
                        </div>
                    </div>
                `;
                videoGrid.innerHTML += card;
            }
        });
    } catch (error) {
        console.error('Videolar yüklenemedi:', error);
    }
}

fetchVideos();
