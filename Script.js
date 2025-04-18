// Script.js: Replace entire file with cleaned-up version
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

// Search functionality
async function handleSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!query || !resultsContainer) return;

    resultsContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
    resultsContainer.classList.remove('hidden');

    let results = [];

    // Search news
    try {
        const newsResponse = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=10&title_contains=${encodeURIComponent(query)}`);
        if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            results.push(...newsData.results.map(item => ({
                type: 'News',
                title: item.title,
                url: item.url
            })));
        }
    } catch (error) {
        console.error('Error searching news:', error);
    }

    // Search launches
    try {
        const launchesResponse = await fetch('https://api.spacexdata.com/v5/launches/upcoming');
        if (launchesResponse.ok) {
            const launches = await launchesResponse.json();
            results.push(...launches
                .filter(launch => launch.name.toLowerCase().includes(query.toLowerCase()))
                .map(launch => ({
                    type: 'Launch',
                    title: launch.name,
                    url: '#launches-modal'
                })));
        }
    } catch (error) {
        console.error('Error searching launches:', error);
    }

    // Display results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
    } else {
        resultsContainer.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="${item.url.startsWith('#') ? `openModal('${item.url.slice(1)}')` : `window.open('${item.url}', '_blank')`}">
                <strong>${item.type}:</strong> ${item.title}
            </div>
        `).join('');
    }
}

// NASA Image API integration
async function fetchNASAImages() {
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
    
    const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk';
    
    for (const [category, data] of Object.entries(imageCategories)) {
        try {
            const searchUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(data.search)}&media_type=image`;
            const response = await fetch(searchUrl);
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.collection.items && result.collection.items.length > 0) {
                    const randomIndex = Math.floor(Math.random() * Math.min(10, result.collection.items.length));
                    const item = result.collection.items[randomIndex];
                    
                    if (item.links && item.links.length > 0) {
                        const imageUrl = item.links[0].href;
                        
                        const cardImage = document.getElementById(data.cardImageId);
                        if (cardImage) {
                            cardImage.src = imageUrl;
                            cardImage.onerror = () => {
                                cardImage.src = '/api/placeholder/350/180';
                            };
                        }
                        
                        const modalImage = document.getElementById(data.modalImageId);
                        if (modalImage) {
                            modalImage.src = imageUrl;
                            modalImage.onerror = () => {
                                modalImage.src = '/api/placeholder/500/300';
                            };
                        }
                    }
                } else {
                    await fetchAPODFallback(data);
                }
            } else {
                await fetchAPODFallback(data);
            }
        } catch (error) {
            console.error(`Error fetching ${category} images:`, error);
            const cardImage = document.getElementById(data.cardImageId);
            const modalImage = document.getElementById(data.modalImageId);
            
            if (cardImage) cardImage.src = `/api/placeholder/350/180`;
            if (modalImage) modalImage.src = `/api/placeholder/500/300`;
        }
    }
}

// Fallback to APOD
async function fetchAPODFallback(data) {
    try {
        const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=1`;
        const apodResponse = await fetch(apodUrl);
        
        if (apodResponse.ok) {
            const apodData = await apodResponse.json();
            if (apodData.length > 0 && apodData[0].url) {
                const imageUrl = apodData[0].url;
                
                const cardImage = document.getElementById(data.cardImageId);
                if (cardImage) {
                    cardImage.src = imageUrl;
                    cardImage.onerror = () => {
                        cardImage.src = '/api/placeholder/350/180';
                    };
                }
                
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

// Fetch upcoming launches
async function fetchUpcomingLaunches() {
    try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/upcoming');
        if (response.ok) {
            const launches = await response.json();
            if (launches.length > 0) {
                const nextLaunch = launches[0];
                
                document.getElementById('launch-title').textContent = nextLaunch.name || 'Upcoming Mission';
                document.getElementById('launch-text').textContent = 
                    nextLaunch.details || 
                    `SpaceX mission launching from ${nextLaunch.launchpad?.name || 'Kennedy Space Center'}. Stay updated on this and future missions.`;
                
                const launchDate = new Date(nextLaunch.date_utc);
                document.getElementById('launch-date').textContent = 
                    `${launchDate.toLocaleDateString()} at ${launchDate.toLocaleTimeString()}`;
                
                updateLaunchCountdown(launchDate);
                setInterval(() => updateLaunchCountdown(launchDate), 1000);
                
                window.upcomingLaunches = launches;
                
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

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value.trim());
        });
    }
    fetchSpaceWeather();
    fetchNASAImages();
    fetchUpcomingLaunches();
});