// ISS Tracker JavaScript

// Configuration
const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const MAP_UPDATE_INTERVAL = 5000; // 5 seconds between updates

// Global variables
let issData = null;
let updateInterval = null;

// Three.js variables
let scene, camera, renderer, earth, issMarker, issGlow;
let isGlobeInitialized = false;
let earthMaterial = null;
let earthCloudMaterial = null;
let clouds = null;
let controls = null;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup display toggles
    setupDisplayToggles();
    
    // Fetch the ISS data for the first time
    fetchISSData();
    
    // Set up update interval
    updateInterval = setInterval(fetchISSData, MAP_UPDATE_INTERVAL);
    
    // Calculate next pass
    calculateNextPass();
});

// Toggle between different display options
function setupDisplayToggles() {
    const toggleButtons = document.querySelectorAll('.display-toggle');
    const displayPanels = document.querySelectorAll('.display-panel');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const displayType = button.getAttribute('data-display');
            
            // Update active button
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active display
            displayPanels.forEach(panel => panel.classList.remove('active'));
            const activePanel = document.getElementById(`${displayType}-display`);
            activePanel.classList.add('active');
            
            // Initialize globe when it becomes active
            if (displayType === 'globe' && !isGlobeInitialized) {
                initGlobe();
            }
        });
    });
}

// Fetch ISS location data from API
function fetchISSData() {
    fetch(ISS_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            issData = data;
            updateAllDisplays();
        })
        .catch(error => {
            console.error('Error fetching ISS data:', error);
            // Fallback to simulated data if API call fails
            simulateISSData();
        });
}

// Simulate ISS data for testing
function simulateISSData() {
    const latitude = -51.4174 + (Math.random() * 2 - 1);
    const longitude = -72.8692 + (Math.random() * 2 - 1);
    
    issData = {
        latitude: latitude,
        longitude: longitude,
        altitude: 408 + (Math.random() * 5 - 2.5),
        velocity: 27600 + (Math.random() * 200 - 100),
        visibility: Math.random() > 0.5 ? "daylight" : "eclipse",
        timestamp: Date.now()
    };
    
    updateAllDisplays();
}

// Update all displays with current ISS data
function updateAllDisplays() {
    if (!issData) return;
    
    // Update common data elements
    updateCommonData();
    
    // Update specific displays
    updateMapDisplay();
    updateGlobeDisplay();
    updateStatsDisplay();
    updateCrewInfo();
}

// Update common data elements
function updateCommonData() {
    document.getElementById('iss-lat').textContent = issData.latitude.toFixed(4);
    document.getElementById('iss-lng').textContent = issData.longitude.toFixed(4);
    document.getElementById('stat-lat').textContent = issData.latitude.toFixed(4);
    document.getElementById('stat-lng').textContent = issData.longitude.toFixed(4);
    
    const now = new Date();
    document.getElementById('telemetry-time').textContent = 
        `Last Updated: ${now.toLocaleTimeString()}`;
    
    document.getElementById('stat-altitude').textContent = 
        `${Math.round(issData.altitude)} km`;
    document.getElementById('stat-velocity').textContent = 
        `${Math.round(issData.velocity)} km/h`;
        
    const visibility = issData.visibility || 'unknown';
    document.getElementById('stat-visibility').textContent = 
        visibility === 'daylight' ? 'Day (Sunlit)' : 'Night (Eclipse)';
    
    document.getElementById('iss-orbit').textContent = `${Math.round(issData.altitude)} km Altitude`;
}

// Update the map display with current ISS position
function updateMapDisplay() {
    if (!issData) return;
    
    const mapContainer = document.getElementById('iss-map');
    const width = mapContainer.offsetWidth;
    const height = mapContainer.offsetHeight;
    
    const issMarker = document.getElementById('iss-marker');
    
    if (issMarker) {
        const x = (parseFloat(issData.longitude) + 180) * (width / 360);
        const y = (90 - parseFloat(issData.latitude)) * (height / 180);
        
        issMarker.style.left = `${x}px`;
        issMarker.style.top = `${y}px`;
    }
}

// Initialize Three.js globe
// Initialize Three.js globe
function initGlobe() {
    const globeContainer = document.getElementById('iss-globe');
    const canvas = document.getElementById('globe-canvas');
    
    // Set up scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        45,
        globeContainer.offsetWidth / globeContainer.offsetHeight,
        0.1,
        1000
    );
    
    // Set up renderer with alpha
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(globeContainer.offsetWidth, globeContainer.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Set background to black
    scene.background = new THREE.Color(0x000000);
    
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
    
    // Load Earth texture with error handling
    const textureLoader = new THREE.TextureLoader();
    // Use a direct image path to avoid cross-origin issues
    const earthTexture = textureLoader.load('/api/placeholder/2048/1024');
    
    // Use MeshPhongMaterial for the main Earth
    earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        transparent: true,
        opacity: 1.0,
        shininess: 25,
        specular: 0x333333
    });
    
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create Earth wireframe/outline for when the Earth is transparent
    const wireframeGeometry = new THREE.SphereGeometry(5.01, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x3366cc,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    const earthWireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(earthWireframe);
    
    // Add grid lines for longitude/latitude
    const gridGeometry = new THREE.SphereGeometry(5.02, 24, 24);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x3377ff,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    const earthGrid = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(earthGrid);
    
    // Create ISS marker (larger size)
    const issGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const issMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xfc3d21,
        specular: 0xffffff,
        shininess: 100
    });
    issMarker = new THREE.Mesh(issGeometry, issMaterial);
    scene.add(issMarker);
    
    // Add glow effect to ISS marker
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfc3d21,
        transparent: true,
        opacity: 0.4
    });
    issGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(issGlow);
    
    // Add stronger lighting
    const ambientLight = new THREE.AmbientLight(0x909090, 1.0); // Brighter ambient light
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100); // Stronger directional light
    pointLight.position.set(15, 5, 15);
    scene.add(pointLight);
    
    // Add a secondary light for the dark side
    const secondaryLight = new THREE.PointLight(0x2846a8, 0.5, 100);
    secondaryLight.position.set(-15, -5, -15);
    scene.add(secondaryLight);
    
    // Position camera
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);
    
    // Add orbit controls with error handling
    try {
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.rotateSpeed = 0.5;
            controls.minDistance = 7;
            controls.maxDistance = 20;
        } else {
            console.warn("THREE.OrbitControls is not available. User won't be able to control the globe view.");
        }
    } catch (e) {
        console.error("Could not initialize OrbitControls:", e);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = globeContainer.offsetWidth / globeContainer.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(globeContainer.offsetWidth, globeContainer.offsetHeight);
    });
    
    // Start animation
    animateGlobe();
    
    isGlobeInitialized = true;
}

// Animate the globe
function animateGlobe() {
    requestAnimationFrame(animateGlobe);
    
    // Rotate Earth slowly if it exists
    if (earth) {
        earth.rotation.y += 0.002;
    }
    
    // Update ISS position if data is available
    if (issMarker && issData) {
        updateISSPosition();
        
        // Check if ISS is behind the Earth relative to the camera
        if (isGlobeInitialized && earth && issMarker) {
            // Only check visibility every few frames to improve performance
            if (Math.floor(Date.now() / 500) % 2 === 0) {
                checkISSVisibility();
            }
        }
    }
    
    // Update controls if they exist
    if (controls) {
        controls.update();
    }
    
    // Ensure Earth is visible
    if (earth && earthMaterial && earthMaterial.opacity === 0) {
        earthMaterial.opacity = 1.0;
    }
    
    renderer.render(scene, camera);
}

// Update ISS position on the globe
function updateISSPosition() {
    if (!issData || !issMarker || !issGlow) return;
    
    // Ensure latitude and longitude are valid numbers
    const latitude = parseFloat(issData.latitude);
    const longitude = parseFloat(issData.longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) {
        console.error("Invalid latitude or longitude data:", issData);
        return;
    }
    
    // Convert to radians
    const lat = latitude * (Math.PI / 180);
    const lon = longitude * (Math.PI / 180);
    
    // Set altitude slightly above Earth's surface (Earth radius is 5)
    const altitude = 5.5;
    
    // Convert lat/lon to 3D coordinates
    const x = altitude * Math.cos(lat) * Math.cos(lon);
    const y = altitude * Math.sin(lat);
    const z = -altitude * Math.cos(lat) * Math.sin(lon);
    
    // Update positions
    issMarker.position.set(x, y, z);
    issGlow.position.set(x, y, z);
    
    // Add a pulsing effect to make ISS more visible
    const pulseScale = 1 + 0.2 * Math.sin(Date.now() * 0.003); // Subtle pulsing effect
    issGlow.scale.set(pulseScale, pulseScale, pulseScale);
}

// Check if ISS is behind the Earth relative to the camera

// Check if ISS is behind the Earth relative to the camera
function checkISSVisibility() {
    // Make sure earth and issMarker are defined before proceeding
    if (!earth || !issMarker) {
        return;
    }
    
    // Get vectors pointing from camera to ISS and from camera to Earth center
    const cameraPosition = camera.position.clone();
    const issPosition = issMarker.position.clone();
    const earthPosition = earth.position.clone();
    
    // Get vector from camera to ISS
    const cameraToISS = issPosition.clone().sub(cameraPosition);
    
    // Get vector from camera to Earth center
    const cameraToEarth = earthPosition.clone().sub(cameraPosition);
    
    // Get vector from Earth center to ISS
    const earthToISS = issPosition.clone().sub(earthPosition);
    
    // Normalize vectors to get directions
    const cameraToISSDir = cameraToISS.clone().normalize();
    const cameraToEarthDir = cameraToEarth.clone().normalize();
    
    // Calculate dot product to determine if ISS is behind Earth
    const dotProduct = cameraToISSDir.dot(cameraToEarthDir);
    
    // Calculate distance from camera to ISS
    const distanceToISS = cameraToISS.length();
    
    // Calculate distance from camera to Earth
    const distanceToEarth = cameraToEarth.length();
    
    // Calculate distance from Earth center to ISS
    const earthToISSLength = earthToISS.length();
    
    // The ISS is behind Earth relative to camera if:
    // 1. The angle between camera-to-Earth and camera-to-ISS vectors is small (dot product close to 1)
    // 2. The distance from camera to ISS is greater than the distance from camera to Earth
    // 3. The ISS is on the far side of Earth
    
    // More lenient check to ensure transparency is triggered appropriately
    const isBehindEarth = dotProduct > 0.80 && 
                          distanceToISS > distanceToEarth && 
                          earthToISSLength > 4.5;
    
    // Make Earth transparent when ISS is behind it
    if (isBehindEarth) {
        // Make Earth semi-transparent with smooth transition - but not completely invisible
        if (earthMaterial && earthMaterial.opacity > 0.15) {
            earthMaterial.opacity = 0.15;
        }
        
        // Visual feedback in the UI
        const latElement = document.getElementById('globe-iss-lat');
        const lngElement = document.getElementById('globe-iss-lng');
        if (latElement) latElement.style.color = '#fc3d21';
        if (lngElement) lngElement.style.color = '#fc3d21';
        
        // Add a visual indicator text in the overlay
        const overlayElement = document.querySelector('.globe-overlay');
        if (overlayElement) {
            let indicator = document.getElementById('behind-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'behind-indicator';
                indicator.style.color = '#fc3d21';
                indicator.style.fontWeight = 'bold';
                indicator.style.marginTop = '10px';
                indicator.textContent = 'ISS is behind Earth';
                overlayElement.appendChild(indicator);
            }
        }
    } else {
        // Make Earth opaque again with smooth transition
        if (earthMaterial && earthMaterial.opacity < 1.0) {
            earthMaterial.opacity = 1.0;
        }
        
        // Reset visual feedback
        const latElement = document.getElementById('globe-iss-lat');
        const lngElement = document.getElementById('globe-iss-lng');
        if (latElement) latElement.style.color = '';
        if (lngElement) lngElement.style.color = '';
        
        // Remove indicator if it exists
        const indicator = document.getElementById('behind-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Update the 3D globe display
function updateGlobeDisplay() {
    if (!issData || !isGlobeInitialized) return;
    
    updateISSPosition();
    
    // Update coordinates display
    document.getElementById('globe-iss-lat').textContent = issData.latitude.toFixed(4);
    document.getElementById('globe-iss-lng').textContent = issData.longitude.toFixed(4);
}

// Update the stats display
function updateStatsDisplay() {
    if (!issData) return;
    
    document.getElementById('stat-orbit').textContent = '138,422';
    document.getElementById('stat-solar').textContent = 'Generating 75 kW';
    
    updateLocationDescription();
    
    if (Math.random() < 0.2) {
        updateMissionLog();
    }
}

// Update location description based on ISS coordinates
function updateLocationDescription() {
    const lat = issData.latitude;
    const lng = issData.longitude;
    
    let location = "Unknown region";
    
    if (lat > 60) {
        location = "Arctic region";
    } else if (lat < -60) {
        location = "Antarctic region";
    } else if (lat > 20 && lat < 40 && lng > -100 && lng < -50) {
        location = "North Atlantic Ocean";
    } else if (lat > 20 && lat < 40 && lng > 120 && lng < 180) {
        location = "North Pacific Ocean";
    } else if (lat < -20 && lat > -40 && lng > 0 && lng < 120) {
        location = "Indian Ocean";
    } else if (lat < 20 && lat > -20 && lng > -70 && lng < -40) {
        location = "Amazon Rainforest";
    } else if (lat > 40 && lat < 60 && lng > -10 && lng < 40) {
        location = "Europe";
    } else if (lat > 35 && lat < 50 && lng > 100 && lng < 145) {
        location = "East Asia";
    } else if (lat > 5 && lat < 35 && lng > 65 && lng < 90) {
        location = "Indian Subcontinent";
    } else if (lat > 25 && lat < 50 && lng > -125 && lng < -65) {
        location = "North America";
    } else if (lat < -10 && lat > -40 && lng > 110 && lng < 155) {
        location = "Australia";
    } else if (lat < -20 && lat > -60 && lng > -80 && lng < -50) {
        location = "South America";
    } else if (lat < 35 && lat > 0 && lng > 0 && lng < 40) {
        location = "Africa";
    } else {
        location = "Over Ocean";
    }
    
    document.getElementById('stat-location').textContent = location;
}

// Update mission log with simulated activities
function updateMissionLog() {
    const now = new Date();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} UTC`;
    
    const activities = [
        "Crew conducting plant growth experiments in the Japanese Kibo module",
        "Medical tests monitoring astronaut bone density changes",
        "Maintenance on the water recovery system",
        "Robot arm operations practice for upcoming cargo delivery",
        "Testing new communications equipment with ground control",
        "Exercise routine to maintain muscle mass in microgravity",
        "Photography of tropical storms over the Pacific Ocean",
        "Solar array adjustment to optimize power generation",
        "Preparing equipment for upcoming spacewalk",
        "Testing new propulsion technology for future Mars missions"
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    const missionLog = document.getElementById('mission-log');
    
    const newEntry = document.createElement('div');
    newEntry.className = 'log-entry';
    newEntry.innerHTML = `
        <div class="log-time">${currentTime}</div>
        <div class="log-activity">${randomActivity}</div>
    `;
    
    missionLog.insertBefore(newEntry, missionLog.firstChild);
    
    if (missionLog.children.length > 5) {
        missionLog.removeChild(missionLog.lastChild);
    }
}

// Calculate the next visible ISS pass for the user's location
function calculateNextPass() {
    const nextPassElement = document.getElementById('stat-next-pass');
    
    nextPassElement.innerHTML = '<a href="#" class="calculate-pass">Calculate for your location</a>';
    
    const calculateLink = document.querySelector('.calculate-pass');
    if (calculateLink) {
        calculateLink.addEventListener('click', simulatePassCalculation);
    }
}

// Simulate calculating the next ISS pass
function simulatePassCalculation(event) {
    event.preventDefault();
    
    const nextPassElement = document.getElementById('stat-next-pass');
    nextPassElement.textContent = "Calculating...";
    
    setTimeout(() => {
        const now = new Date();
        const hoursToAdd = Math.floor(Math.random() * 10) + 2;
        const nextPass = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
        
        const options = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        const formattedDate = nextPass.toLocaleDateString('en-US', options);
        
        nextPassElement.textContent = formattedDate;
        
        const visibility = ['Good (visible for 4 min)', 'Moderate (visible for 2 min)', 'Brief (visible for <1 min)'];
        const randomVisibility = visibility[Math.floor(Math.random() * visibility.length)];
        
        const visibilityInfo = document.createElement('div');
        visibilityInfo.style.fontSize = '0.8rem';
        visibilityInfo.style.marginTop = '5px';
        visibilityInfo.style.color = '#ccc';
        visibilityInfo.textContent = randomVisibility;
        
        nextPassElement.appendChild(visibilityInfo);
    }, 2000);
}

// Update ISS crew information
function updateCrewInfo() {
    const crewCount = 7;
    document.getElementById('iss-crew-count').textContent = `${crewCount} Astronauts`;
    
    document.getElementById('iss-operational-status').textContent = 'Operational';
}

// Clean up resources when leaving the page
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// Helper function for the search toggle
function toggleSearch() {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
        searchContainer.classList.toggle('show');
    }
}