// script.js

// Helper function to update launch countdown
function updateLaunchCountdown(launchDate) {
    const countdownElement = document.getElementById('launch-countdown');
    const modalCountdownElement = document.getElementById('modal-launch-countdown');
    const now = new Date();
    const diff = launchDate - now;
    
    if (diff <= 0) {
        countdownElement.textContent = 'Launched';
        if (modalCountdownElement) modalCountdownElement.textContent = 'Launched';
        return;
    }
    
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const countdown = `T-${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    countdownElement.textContent = countdown;
    if (modalCountdownElement) modalCountdownElement.textContent = countdown;
}

// Fetch latest news from NASA and Spaceflight News API
async function fetchLatestNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        let allNews = [];
        
        // Fetch NASA news (APOD)
        const nasaApiKey = 'DEMO_KEY'; // Replace with your NASA API key for production
        const nasaResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=3`);
        if (nasaResponse.ok) {
            const nasaData = await nasaResponse.json();
            allNews.push(...nasaData.map(item => ({
                title: item.title,
                content: item.explanation,
                image: item.url || 'https://via.placeholder.com/180x120',
                date: new Date(item.date),
                source: 'NASA',
                url: item.hdurl || item.url
            })));
        } else {
            console.warn('NASA API request failed:', nasaResponse.status);
        }
        
        // Fetch additional news from Spaceflight News API
        const spaceflightResponse = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=3');
        if (spaceflightResponse.ok) {
            const spaceflightData = await spaceflightResponse.json();
            allNews.push(...spaceflightData.results.map(item => ({
                title: item.title,
                content: item.summary,
                image: item.image_url || 'https://via.placeholder.com/180x120',
                date: new Date(item.published_at),
                source: item.news_site,
                url: item.url
            })));
        } else {
            console.warn('Spaceflight News API request failed:', spaceflightResponse.status);
        }
        
        // Sort by date (newest first) and limit to 5
        allNews.sort((a, b) => b.date - a.date);
        allNews = allNews.slice(0, 5);
        
        // If no news retrieved, display a message
        if (allNews.length === 0) {
            newsContainer.innerHTML = '<p>No news available at this time. Please try again later.</p>';
            return;
        }
        
        // Generate news HTML
        let newsHtml = '';
        allNews.forEach((item, index) => {
            const formattedDate = item.date.toLocaleDateString();
            newsHtml += `
                <div class="horizontal-news-card" onclick="openNewsModal('news-${index}')">
                    <div class="news-source-tag">${item.source}</div>
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/180x120'">
                    <div class="card-content">
                        <h3>${item.title}</h3>
                        <p>${item.content.substring(0, 60)}${item.content.length > 60 ? '...' : ''}</p>
                        <div class="news-date">${formattedDate}</div>
                    </div>
                </div>
            `;
            
            // Create modal for this news item
            const modalHtml = `
                <div id="news-${index}" class="modal">
                    <div class="modal-content news-modal-content">
                        <span class="close-modal" onclick="closeModal('news-${index}')">×</span>
                        <div class="modal-header">
                            <h2 style="color: #fc3d21; font-family: 'Orbitron', sans-serif;">${item.title}</h2>
                            <div class="mission-tag">${item.source}</div>
                        </div>
                        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/500x300'">
                        <p>${item.content}</p>
                        ${item.url ? `<a href="${item.url}" target="_blank" class="news-link">Read More</a>` : ''}
                        <p style="font-size: 0.8rem; color: #999; margin-top: 15px;">Published: ${formattedDate}</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        });
        
        // Update news container
        newsContainer.innerHTML = newsHtml;
        
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = '<p>Unable to load news. Please try again later.</p>';
    }
}

// Display launches in modal
function displayLaunchesInModal(launches) {
    const launchesList = document.getElementById('launches-list');
    if (!launchesList) return;
    
    let html = '';
    launches.forEach((launch, index) => {
        const launchDate = new Date(launch.date_utc);
        const now = new Date();
        const diffTime = Math.abs(launchDate - now);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let dateDisplay;
        if (diffTime <= 0) {
            dateDisplay = 'Launched';
        } else if (diffDays === 0) {
            const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            dateDisplay = `T-${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        } else if (diffDays === 1) {
            dateDisplay = 'Tomorrow';
        } else if (diffDays < 7) {
            dateDisplay = `In ${diffDays} days`;
        } else if (diffDays < 30) {
            dateDisplay = `In ${Math.ceil(diffDays/7)} weeks`;
        } else {
            dateDisplay = launchDate.toLocaleDateString();
        }
        
        html += `
            <div class="list-item">
                <h4>${launch.name || `Mission #${index + 1}`}</h4>
                <p>${launch.details || `Launch by ${launch.provider || 'SpaceX'} from ${launch.launchpad?.name || 'Kennedy Space Center'}`}</p>
                <div class="launch-date">${dateDisplay}</div>
            </div>
        `;
    });
    
    launchesList.innerHTML = html;
}

// Populate launches modal
async function populateLaunchesModal() {
    const launchesList = document.getElementById('launches-list');
    if (!launchesList) return;
    
    try {
        if (window.upcomingLaunches && window.upcomingLaunches.length > 0) {
            displayLaunchesInModal(window.upcomingLaunches);
        } else {
            const response = await fetch('https://api.spacexdata.com/v5/launches/upcoming');
            if (response.ok) {
                const launches = await response.json();
                if (launches.length > 0) {
                    window.upcomingLaunches = launches;
                    displayLaunchesInModal(launches);
                } else {
                    launchesList.innerHTML = '<p>No upcoming launches available.</p>';
                }
            } else {
                throw new Error('Failed to fetch launch data for modal');
            }
        }
    } catch (error) {
        console.error('Error populating launches modal:', error);
        launchesList.innerHTML = '<p>Unable to load launch data. Please try again later.</p>';
    }
}

// Fetch upcoming launches
async function fetchUpcomingLaunches() {
    try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/upcoming');
        if (response.ok) {
            const launches = await response.json();
            if (launches.length > 0) {
                const nextLaunch = launches[0];
                
                // Update launch card
                document.getElementById('launch-title').textContent = nextLaunch.name || 'Upcoming Mission';
                document.getElementById('launch-text').textContent = 
                    nextLaunch.details || 
                    `SpaceX mission launching from ${nextLaunch.launchpad?.name || 'Kennedy Space Center'}. Stay updated on this and future missions.`;
                
                // Set launch date
                const launchDate = new Date(nextLaunch.date_utc);
                document.getElementById('launch-date').textContent = 
                    `${launchDate.toLocaleDateString()} at ${launchDate.toLocaleTimeString()}`;
                
                // Update countdown
                updateLaunchCountdown(launchDate);
                setInterval(() => updateLaunchCountdown(launchDate), 1000);
                
                // Store launches for modal
                window.upcomingLaunches = launches;
                
                // Hide loading
                const launchesLoading = document.getElementById('launches-loading');
                const launchesContent = document.getElementById('launches-content');
                if (launchesLoading) launchesLoading.classList.add('hidden');
                if (launchesContent) launchesContent.classList.remove('hidden');
                
                return launches;
            } else {
                throw new Error('No upcoming launches found');
            }
        } else {
            throw new Error('Failed to fetch launch data');
        }
    } catch (error) {
        console.error('Error fetching launch data:', error);
        const launchesLoading = document.getElementById('launches-loading');
        const launchesContent = document.getElementById('launches-content');
        if (launchesLoading) launchesLoading.classList.add('hidden');
        if (launchesContent) launchesContent.classList.remove('hidden');
        
        document.getElementById('launch-title').textContent = 'Upcoming Mission';
        document.getElementById('launch-text').textContent = 
            'Stay tuned for the next space mission launch.';
        document.getElementById('launch-date').textContent = 'TBD';
        document.getElementById('launch-countdown').textContent = 'TBD';
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Populate launches modal if opened
        if (modalId === 'launches-modal') {
            populateLaunchesModal();
        }
        
        // Ensure close buttons are clickable
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.style.zIndex = '20';
            button.addEventListener('click', function() {
                const modalId = this.closest('.modal').id;
                closeModal(modalId);
            });
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openNewsModal(modalId) {
    openModal(modalId);
}