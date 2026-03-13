const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc';
const CHANNEL_ID = 'UC6Wv9V7q4X8Y3Mh2vG9Fk0A'; // Senin kanal ID'n bu şekilde olmalı

async function fetchVideos() {
    // Arama URL'si (Doğru API endpoint'i budur)
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const videoGrid = document.getElementById('video-grid');
        
        if (data.error) {
            console.error('API Hatası:', data.error.message);
            videoGrid.innerHTML = `<p style="color:red; text-align:center;">Hata: ${data.error.message}</p>`;
            return;
        }

        videoGrid.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            videoGrid.innerHTML = '<p style="text-align:center;">Henüz video bulunamadı.</p>';
            return;
        }

        data.items.forEach(item => {
            if(item.id.videoId) {
                const card = `
                    <div class="video-card">
                        <div class="video-container">
                            <iframe src="https://www.youtube.com/embed/${item.id.videoId}" allowfullscreen></iframe>
                        </div>
                        <div class="video-info">
                            <h3>${item.snippet.title}</h3>
                        </div>
                    </div>
                `;
                videoGrid.innerHTML += card;
            }
        });
    } catch (error) {
        console.error('Bağlantı Hatası:', error);
        document.getElementById('video-grid').innerHTML = '<p>Videolar şu an yüklenemiyor.</p>';
    }
}

fetchVideos();
