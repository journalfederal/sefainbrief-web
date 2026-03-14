const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc';
const CHANNEL_ID = 'UC6Wv9V7q4X8Y3Mh2vG9Fk0A'; 

async function fetchVideos() {
    const videoGrid = document.getElementById('video-grid');
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            // Gerçek hatayı konsola yazdır ki ne olduğunu anlayalım
            console.error('YouTube API Hatası:', data.error.message);
            videoGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 2rem; background: rgba(255,0,0,0.1); border-radius: 10px;">
                    <p style="color:#ff4444; font-weight:bold;">API Veri Akışı Beklemede</p>
                    <p style="font-size:0.8rem; color:var(--text-dim); margin-top:0.5rem;">Google Cloud Console'da API kısıtlamalarını kontrol edin.</p>
                </div>`;
            return;
        }

        videoGrid.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            videoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Henüz analiz videosu bulunamadı.</p>';
            return;
        }

        data.items.forEach(item => {
            const card = `
                <div class="video-card">
                    <iframe src="https://www.youtube.com/embed/${item.id.videoId}" allowfullscreen></iframe>
                    <div class="video-info">
                        <h3>${item.snippet.title}</h3>
                    </div>
                </div>
            `;
            videoGrid.innerHTML += card;
        });
    } catch (error) {
        console.error('Bağlantı Hatası:', error);
        videoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Bağlantı sağlanamadı.</p>';
    }
}

fetchVideos();
