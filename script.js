const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc'; 
const CHANNEL_ID = 'UC6Wv9V7q4X8Y3Mh2vG9Fk0A'; 

async function fetchVideos() {
    const videoGrid = document.getElementById('video-grid');
    // maxResults'ı 9 yaparak daha dolu bir haber sitesi görünümü elde ediyoruz.
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=9&type=video`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('YouTube API Error:', data.error.message);
            videoGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 2rem; border: 1px solid #ffcccc; background: #fff0f0; border-radius: 4px; color: #cc0000;">
                    <p><strong>API Data Feed Pending</strong></p>
                    <p style="font-size:0.9rem; margin-top:0.5rem;">Please check Google Cloud Console API restrictions for your domain.</p>
                </div>`;
            return;
        }

        videoGrid.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            videoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No recent intelligence briefings found.</p>';
            return;
        }

        data.items.forEach(item => {
            // Tarihi okunabilir "Haber" formatına çeviriyoruz (Örn: March 23, 2026)
            const publishedDate = new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // YouTube API bazen başlıkları HTML entity (&#39;) olarak döndürür, bunu temizliyoruz
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = item.snippet.title;
            const cleanTitle = tempDiv.textContent || tempDiv.innerText;

            const card = `
                <article class="video-card">
                    <iframe src="https://www.youtube.com/embed/${item.id.videoId}" allowfullscreen title="${cleanTitle}"></iframe>
                    <div class="video-info">
                        <h3>${cleanTitle}</h3>
                        <p>${publishedDate}</p>
                    </div>
                </article>
            `;
            videoGrid.innerHTML += card;
        });
    } catch (error) {
        console.error('Connection Error:', error);
        videoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Failed to connect to the intelligence feed.</p>';
    }
}

// Sayfa yüklendiğinde videoları çek
document.addEventListener('DOMContentLoaded', fetchVideos);
