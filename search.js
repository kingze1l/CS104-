// search.js - Modified to work with your existing code

// Global variables to store data for search
let globalNewsData = [];
let globalPlanetsData = [];
let searchIndex = {
    news: [],
    planets: []
};

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});

// Initialize the search functionality
function initializeSearch() {
    // Set up search input functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Add event listener for input changes
        searchInput.addEventListener('input', handleSearchInput);
        
        // Add event listener for form submission
        const searchForm = searchInput.closest('form') || searchInput.parentElement;
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                performSearch(searchInput.value);
            });
        }

        // Create and append the autocomplete container
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.id = 'search-autocomplete';
        autocompleteContainer.className = 'search-autocomplete';
        if (!document.getElementById('search-autocomplete')) {
            searchInput.parentNode.appendChild(autocompleteContainer);
        }
    }

    // Collect data for search index
    collectSearchData();
}

// Collect data for search
async function collectSearchData() {
    // Determine which page we're on
    const currentPath = window.location.pathname;
    
    // Collect news data if we're on the home page or news page
    if (currentPath.includes('SpaceProject.html') || currentPath.includes('index.html') || currentPath === '/' || currentPath.includes('News')) {
        await fetchNewsForSearch();
    }
    
    // Collect planets data if we're on the about planets page
    if (currentPath.includes('About.html')) {
        await fetchPlanetsForSearch();
    }
}

// Fetch news data for search
async function fetchNewsForSearch() {
    try {
        // First try to get NASA APOD news
        const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk';
        const nasaResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=10`);
        
        if (nasaResponse.ok) {
            const nasaData = await nasaResponse.json();
            globalNewsData = [...globalNewsData, ...nasaData.map(item => ({
                id: `nasa-${item.date}`,
                title: item.title,
                content: item.explanation,
                image: item.url || '/api/placeholder/180/120',
                date: new Date(item.date),
                source: 'NASA',
                url: item.hdurl || item.url,
                type: 'news'
            }))];
        }
        
        // Then try to get Spaceflight News API data
        const spaceflightResponse = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=20');
        if (spaceflightResponse.ok) {
            const spaceflightData = await spaceflightResponse.json();
            globalNewsData = [...globalNewsData, ...spaceflightData.results.map(item => ({
                id: `sf-${item.id}`,
                title: item.title,
                content: item.summary,
                image: item.image_url || '/api/placeholder/180/120',
                date: new Date(item.published_at),
                source: item.news_site,
                url: item.url,
                type: 'news'
            }))];
        }
        
        // Build search index for news
        searchIndex.news = globalNewsData.map(item => ({
            id: item.id,
            text: `${item.title.toLowerCase()} ${item.content.toLowerCase()} ${item.source.toLowerCase()}`,
            data: item
        }));
        
        console.log(`Search index built with ${searchIndex.news.length} news items`);
    } catch (error) {
        console.error('Error fetching news for search:', error);
    }
}

// Fetch planets data for search
async function fetchPlanetsForSearch() {
    try {
        const apiKey = "COjts7snVqyUL9OD04ukQA==sHTQPO0uLGRS46bQ";
        const planetNames = [
            "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
        ];

        const promises = planetNames.map((planetName) =>
            fetch(`https://api.api-ninjas.com/v1/planets?name=${planetName}`, { 
                headers: { "X-Api-Key": apiKey } 
            })
            .then((response) => response.json())
            .then((data) => data[0] || null)
            .catch(() => null)
        );

        const planetsData = await Promise.all(promises);
        
        globalPlanetsData = planetsData
            .filter(planet => planet !== null)
            .map(planet => ({
                id: `planet-${planet.name.toLowerCase()}`,
                name: planet.name,
                mass: planet.mass,
                radius: planet.radius,
                temperature: planet.temperature,
                period: planet.period,
                semi_major_axis: planet.semi_major_axis,
                distance_light_year: planet.distance_light_year,
                host_star_mass: planet.host_star_mass,
                host_star_temperature: planet.host_star_temperature,
                type: 'planet'
            }));
            
        // Build search index for planets
        searchIndex.planets = globalPlanetsData.map(item => ({
            id: item.id,
            text: `${item.name.toLowerCase()} planet`,
            data: item
        }));
        
        console.log(`Search index built with ${searchIndex.planets.length} planets`);
    } catch (error) {
        console.error('Error fetching planets for search:', error);
    }
}

function handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    const autocompleteContainer = document.getElementById('search-autocomplete');
    
    // Clear previous results
    if (autocompleteContainer) {
        autocompleteContainer.innerHTML = '';
    }
    
    if (query.length < 1) {
        if (autocompleteContainer) {
            autocompleteContainer.style.display = 'none';
        }
        return;
    }
    
    // Search in both indexes
    const newsResults = searchIndex.news.filter(item => 
        item.text.includes(query)
    ).slice(0, 4);
    
    const planetResults = searchIndex.planets.filter(item => 
        item.text.includes(query)
    ).slice(0, 4);
    
    // Check if we have any results
    if ((newsResults.length === 0 && planetResults.length === 0) || !autocompleteContainer) {
        if (autocompleteContainer) {
            autocompleteContainer.style.display = 'none';
        }
        return;
    }
    
    // Display autocomplete results
    autocompleteContainer.style.display = 'block';
    
    // Add planet results with category header if we have any
    if (planetResults.length > 0) {
        // Add category header
        const planetHeader = document.createElement('div');
        planetHeader.className = 'autocomplete-category';
        planetHeader.textContent = 'Planets';
        autocompleteContainer.appendChild(planetHeader);
        
        // Add planet items
        planetResults.forEach(result => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item planet-item';
            
            item.innerHTML = `
                <div class="autocomplete-icon planet-icon">🪐</div>
                <div class="autocomplete-content">
                    <div class="autocomplete-title">${result.data.name}</div>
                    <div class="autocomplete-subtitle">Planet</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                openPlanetModal(result.data);
                document.getElementById('search-input').value = '';
                autocompleteContainer.style.display = 'none';
            });
            
            autocompleteContainer.appendChild(item);
        });
    }
    
    // Add news results with category header if we have any
    if (newsResults.length > 0) {
        // Add category header
        const newsHeader = document.createElement('div');
        newsHeader.className = 'autocomplete-category';
        newsHeader.textContent = 'News';
        autocompleteContainer.appendChild(newsHeader);
        
        // Add news items
        newsResults.forEach(result => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item news-item';
            
            item.innerHTML = `
                <div class="autocomplete-icon news-icon">📰</div>
                <div class="autocomplete-content">
                    <div class="autocomplete-title">${result.data.title}</div>
                    <div class="autocomplete-subtitle">${result.data.source} - ${formatDate(result.data.date)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                window.open(result.data.url, '_blank');
                document.getElementById('search-input').value = '';
                autocompleteContainer.style.display = 'none';
            });
            
            autocompleteContainer.appendChild(item);
        });
    }
    
    // Add "See all results" option if needed
    if (newsResults.length > 3 || planetResults.length > 3) {
        const seeAllItem = document.createElement('div');
        seeAllItem.className = 'autocomplete-item see-all';
        seeAllItem.textContent = 'See all results';
        seeAllItem.addEventListener('click', () => {
            performSearch(query);
            document.getElementById('search-input').value = '';
            autocompleteContainer.style.display = 'none';
        });
        autocompleteContainer.appendChild(seeAllItem);
    }
}

// Format date to a readable string
function formatDate(date) {
    return date.toLocaleDateString();
}

// Perform full search and display results
function performSearch(query) {
    query = query.toLowerCase().trim();
    
    if (query.length < 1) return;
    
    // Search in both indexes
    const newsResults = searchIndex.news.filter(item => 
        item.text.includes(query)
    );
    
    const planetResults = searchIndex.planets.filter(item => 
        item.text.includes(query)
    );
    
    // Create search results modal
    let searchResultsModal = document.getElementById('search-results-modal');
    
    if (!searchResultsModal) {
        searchResultsModal = document.createElement('div');
        searchResultsModal.id = 'search-results-modal';
        searchResultsModal.className = 'modal';
        document.body.appendChild(searchResultsModal);
    }
    
    // Create modal content
    searchResultsModal.innerHTML = `
        <div class="modal-content search-results-content">
            <span class="close-modal" onclick="closeModal('search-results-modal')">&times;</span>
            <div class="modal-header">
                <h2 style="color: #fc3d21; font-family: 'Orbitron', sans-serif;">Search Results</h2>
                <div class="search-query">Query: "${query}"</div>
            </div>
            
            <div class="search-results-count">
                Found ${newsResults.length + planetResults.length} results
            </div>
            
            <div class="search-results-sections">
                ${planetResults.length > 0 ? `
                <div class="search-section">
                    <h3>Planets (${planetResults.length})</h3>
                    <div class="search-planets-grid" id="search-planets-results"></div>
                </div>
                ` : ''}
                
                ${newsResults.length > 0 ? `
                <div class="search-section">
                    <h3>News (${newsResults.length})</h3>
                    <div class="search-news-list" id="search-news-results"></div>
                </div>
                ` : ''}
                
                ${(newsResults.length === 0 && planetResults.length === 0) ? `
                <div class="no-results">
                    <p>No results found for "${query}".</p>
                    <p>Try different keywords or check your spelling.</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Display the modal
    openModal('search-results-modal');
    
    // Populate planets results
    const planetsResultsContainer = document.getElementById('search-planets-results');
    if (planetsResultsContainer && planetResults.length > 0) {
        planetResults.forEach(result => {
            const planetCard = document.createElement('div');
            planetCard.className = 'planet-result-card';
            planetCard.innerHTML = `
                <h4>${result.data.name}</h4>
                <p>Mass: ${result.data.mass} Earth masses</p>
                <p>Radius: ${result.data.radius} Earth radii</p>
                <button class="more-info-btn">More Info</button>
            `;
            
            planetCard.querySelector('button').addEventListener('click', () => {
                openPlanetModal(result.data);
            });
            
            planetsResultsContainer.appendChild(planetCard);
        });
    }
    
    // Populate news results
    const newsResultsContainer = document.getElementById('search-news-results');
    if (newsResultsContainer && newsResults.length > 0) {
        newsResults.forEach(result => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-result-item';
            newsItem.innerHTML = `
                <div class="news-result-image">
                    <img src="${result.data.image}" alt="${result.data.title}" onerror="this.src='/api/placeholder/120/80'">
                </div>
                <div class="news-result-content">
                    <h4>${result.data.title}</h4>
                    <p>${result.data.content.substring(0, 100)}${result.data.content.length > 100 ? '...' : ''}</p>
                    <div class="news-result-meta">
                        <span>${result.data.source}</span>
                        <span>${formatDate(result.data.date)}</span>
                    </div>
                </div>
            `;
            
            newsItem.addEventListener('click', () => {
                window.open(result.data.url, '_blank');
            });
            
            newsResultsContainer.appendChild(newsItem);
        });
    }
}

// Open planet modal
function openPlanetModal(planet) {
    // Create or get planet modal
    let planetModal = document.getElementById('planetModal');
    
    if (!planetModal) {
        planetModal = document.createElement('div');
        planetModal.id = 'planetModal';
        planetModal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.id = 'modalContent';
        
        const closeButton = document.createElement('span');
        closeButton.className = 'close-modal';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = function() { closeModal('planetModal'); };
        
        modalContent.appendChild(closeButton);
        planetModal.appendChild(modalContent);
        document.body.appendChild(planetModal);
    }
    
    // Format temperature
    const temperatureCelsius = (planet.temperature - 273.15).toFixed(2);
    
    // Update modal content
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <span class="close-modal" onclick="closeModal('planetModal')">&times;</span>
        <h2>${planet.name}</h2>
        <p><strong>Mass:</strong> ${planet.mass} Earth masses</p>
        <p><strong>Radius:</strong> ${planet.radius} Earth radii</p>
        <p><strong>Temperature:</strong> ${temperatureCelsius} °C</p>
        <p><strong>Orbital Period:</strong> ${planet.period} Earth days</p>
        <p><strong>Semi-Major Axis:</strong> ${planet.semi_major_axis} AU</p>
        <p><strong>Distance from Earth (light-years):</strong> ${planet.distance_light_year} light-years</p>
        <p><strong>Host Star Mass:</strong> ${planet.host_star_mass} Solar masses</p>
        <p><strong>Host Star Temperature:</strong> ${planet.host_star_temperature} K</p>
        <iframe src="https://eyes.nasa.gov/apps/solar-system/#/${planet.name.toLowerCase()}?embed=true&logo=false" allowfullscreen></iframe>
    `;
    
    // Display the modal
    openModal('planetModal');
}

// Event listener to close autocomplete when clicking outside
document.addEventListener('click', function(event) {
    const autocompleteContainer = document.getElementById('search-autocomplete');
    const searchInput = document.getElementById('search-input');
    
    if (autocompleteContainer && searchInput) {
        if (!autocompleteContainer.contains(event.target) && event.target !== searchInput) {
            autocompleteContainer.style.display = 'none';
        }
    }
});

// Expose functions to global scope
window.performSearch = performSearch;
window.openPlanetModal = openPlanetModal;

// Important: Do NOT redefine toggleSearch as it already exists in mainM.js