const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc'; 
const CHANNEL_ID = 'UC6Wv9V7q4X8Y3Mh2vG9Fk0A'; 

async function fetchBriefings() {
    const grid = document.getElementById('video-grid');
    // search yerine playlistItems kullanmak kota dostudur ancak kanalın 'uploads' playlist id'sini gerektirir.
    // Şimdilik search ile devam ediyoruz.
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("YouTube API Hatası:", data.error.message);
            throw new Error(data.error.message);
        }

        grid.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            grid.innerHTML = '<p>No briefings found at the moment.</p>';
            return;
        }

        data.items.forEach(item => {
            const date = new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
            });

            const doc = new DOMParser().parseFromString(item.snippet.title, "text/html");
            const title = doc.documentElement.textContent;

            grid.innerHTML += `
                <article class="video-card">
                    <iframe src="https://www.youtube.com/embed/${item.id.videoId}" allowfullscreen></iframe>
                    <div class="video-info">
                        <div class="date-tag">${date}</div>
                        <h3>${title}</h3>
                    </div>
                </article>
            `;
        });
    } catch (err) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 30px; border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; text-align: center; border-radius: 8px;">
                <p><strong>Intelligence Feed Offline</strong></p>
                <p style="font-size: 0.9rem; margin-top: 5px;">Error: ${err.message}</p>
                <p style="font-size: 0.8rem; margin-top: 10px;">Please ensure your YouTube API Key is active and has no domain restrictions in Google Cloud Console.</p>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBriefings);
