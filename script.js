const API_KEY = 'AIzaSyAKAglEkw1eNHK8GO8mo1X6qc_zgT9vPBc'; 
const CHANNEL_ID = 'UC6Wv9V7q4X8Y3Mh2vG9Fk0A'; 

async function fetchBriefings() {
    const grid = document.getElementById('video-grid');
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        grid.innerHTML = '';

        data.items.forEach(item => {
            const date = new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            // HTML karakterlerini temizle (Örn: &#39; -> ')
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
        console.error("Feed Error:", err);
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 20px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; color: #c53030;">
                <strong>Connection Alert:</strong> The live feed is currently restricted. Please ensure the API Key is active in Google Cloud Console.
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchBriefings);
