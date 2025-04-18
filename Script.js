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
// Fetch space weather data from NOAA
async function fetchSpaceWeather() {
    try {
        const response = await fetch('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json');
        if (response.ok) {
            const data = await response.json();
            const latestFlare = data[0] || {};
            const alertTitle = latestFlare.flare_class ? `Solar Flare Alert: ${latestFlare.flare_class}` : 'No Active Alerts';
            const alertText = latestFlare.message || 'No significant space weather events detected.';
            
            document.getElementById('weather-alert-title').textContent = alertTitle;
            document.getElementById('weather-alert-text').textContent = alertText;
            document.getElementById('weather-alert-image').src = 'https://www.swpc.noaa.gov/sites/default/files/images/primary/xray-flares.png';
            
            document.getElementById('weather-alert-loading').classList.add('hidden');
            document.getElementById('weather-alert-content').classList.remove('hidden');
        } else {
            throw new Error('Failed to fetch space weather data');
        }
    } catch (error) {
        console.error('Error fetching space weather:', error);
        document.getElementById('weather-alert-title').textContent = 'Space Weather Unavailable';
        document.getElementById('weather-alert-text').textContent = 'Unable to load space weather data.';
        document.getElementById('weather-alert-loading').classList.add('hidden');
        document.getElementById('weather-alert-content').classList.remove('hidden');
    }
}
// Dismiss weather alert card
function dismissWeatherAlert() {
    const weatherCard = document.getElementById('weather-alert-card');
    if (weatherCard) {
        weatherCard.style.display = 'none';
    }
}

// Update DOMContentLoaded listener
window.addEventListener('DOMContentLoaded', () => {
    fetchSpaceWeather();
    fetchNASAImages();
    fetchUpcomingLaunches();
    fetchLatestNews();
});
// NASA Image API integration
async function fetchNASAImages() {
    // Define search queries for each category
    const imageCategories = {
        mars: {
            search: 'mars surface curiosity perseverance',
            cardImageId: 'mars-image',
            modalImageId: 'mars-modal-img'
        },
        blackholes: {
            search: 'black hole space',
            cardImageId: 'blackholes-image',
            modalImageId: 'blackholes-modal-img'
        },
        iss: {
            search: 'international space station',
            cardImageId: 'iss-image',
            modalImageId: 'iss-modal-img'
        },
        launches: {
            search: 'rocket launch spacex nasa',
            cardImageId: 'launch-image',
            modalImageId: 'launches-modal-img'
        }
    };
    
    const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk'; // Replace with your NASA API key for production
    
    // Fetch images for each category
    for (const [category, data] of Object.entries(imageCategories)) {
        try {
            // First try NASA Image and Video Library API
            const searchUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(data.search)}&media_type=image`;
            const response = await fetch(searchUrl);
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.collection.items && result.collection.items.length > 0) {
                    // Get random image from the first 10 results (or fewer if less than 10 are available)
                    const randomIndex = Math.floor(Math.random() * Math.min(10, result.collection.items.length));
                    const item = result.collection.items[randomIndex];
                    
                    // The NASA image API returns a collection, and we need to get the actual image URL
                    if (item.links && item.links.length > 0) {
                        const imageUrl = item.links[0].href;
                        
                        // Update card image
                        const cardImage = document.getElementById(data.cardImageId);
                        if (cardImage) {
                            cardImage.src = imageUrl;
                            cardImage.onerror = () => {
                                cardImage.src = '/api/placeholder/350/180';
                            };
                        }
                        
                        // Update modal image
                        const modalImage = document.getElementById(data.modalImageId);
                        if (modalImage) {
                            modalImage.src = imageUrl;
                            modalImage.onerror = () => {
                                modalImage.src = '/api/placeholder/500/300';
                            };
                        }
                    }
                } else {
                    // Fallback to APOD if no images found
                    await fetchAPODFallback(data);
                }
            } else {
                // Fallback to APOD if API request fails
                await fetchAPODFallback(data);
            }
        } catch (error) {
            console.error(`Error fetching ${category} images:`, error);
            // Use fallback images if there's an error
            const cardImage = document.getElementById(data.cardImageId);
            const modalImage = document.getElementById(data.modalImageId);
            
            if (cardImage) cardImage.src = `/api/placeholder/350/180`;
            if (modalImage) modalImage.src = `/api/placeholder/500/300`;
        }
    }
}

// Fallback to Astronomy Picture of the Day (APOD) API
async function fetchAPODFallback(data) {
    try {
        const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=1`;
        const apodResponse = await fetch(apodUrl);
        
        if (apodResponse.ok) {
            const apodData = await apodResponse.json();
            if (apodData.length > 0 && apodData[0].url) {
                const imageUrl = apodData[0].url;
                
                // Update card image
                const cardImage = document.getElementById(data.cardImageId);
                if (cardImage) {
                    cardImage.src = imageUrl;
                    cardImage.onerror = () => {
                        cardImage.src = '/api/placeholder/350/180';
                    };
                }
                
                // Update modal image
                const modalImage = document.getElementById(data.modalImageId);
                if (modalImage) {
                    modalImage.src = imageUrl;
                    modalImage.onerror = () => {
                        modalImage.src = '/api/placeholder/500/300';
                    };
                }
            }
        }
    } catch (error) {
        console.error('APOD fallback failed:', error);
    }
}

// Fetch latest news from NASA and Spaceflight News API
async function fetchLatestNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        let allNews = [];
        
        // Fetch NASA news (APOD)
        const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk'; // Replace with your NASA API key for production
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
                <div class="horizontal-news-card" onclick="window.open('${item.url}', '_blank')">
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

// Initialize the page when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Ensure modals start hidden
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = 'none';
    }
    
    // Fetch NASA images for Mars, Black Holes, and ISS sections
    fetchNASAImages();
    
    // Fetch API data
    fetchUpcomingLaunches();
    fetchLatestNews();
});