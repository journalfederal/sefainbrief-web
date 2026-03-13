const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc';
const CHANNEL_ID = 'UC6Wv9V7q4X8Y3Mh2vG9Fk0A'; // BURAYI KENDİ KANAL ID'N İLE DEĞİŞTİRDİĞİNDEN EMİN OL!

async function fetchVideos() {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const videoGrid = document.getElementById('video-grid');
        
        if (data.error) {
            console.error('API Hatası:', data.error.message);
            videoGrid.innerHTML = `<p style="color:var(--accent); text-align:center;">Hata: API Kısıtlaması Devrede. Domainin onaylanması bekleniyor.</p>`;
            return;
        }

        videoGrid.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            videoGrid.innerHTML = '<p style="text-align:center;">Henüz analiz videosu bulunamadı.</p>';
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
    }
}

fetchVideos();
