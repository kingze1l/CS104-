# NASA Mobile Application

<img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA Logo" width="100"/>

## Overview
This is a mobile-first web application that simulates a NASA mobile experience, allowing users to explore space missions, track the International Space Station in real-time, learn about planets, and stay updated with the latest space news.

## Features

### 🏠 Home
- **Featured Missions**: Displays current NASA missions with detailed modals
- **Latest News**: Horizontal scrolling news cards with up-to-date space information
- **Real-time Launch Countdown**: Shows upcoming rocket launches with countdown timers

### 🚀 ISS Tracker
- **Live ISS Tracking**: View the International Space Station's current location on a 2D map
- **3D Globe Visualization**: Track the ISS orbit in an interactive 3D globe view
- **Real-time Telemetry**: Access live ISS data including altitude, velocity, and orbit information

### 🌍 Planet Explorer
- **Interactive Planet Cards**: Browse through our solar system's planets
- **Detailed Information**: Learn fascinating facts about each planet
- **Search Functionality**: Find specific planets quickly

### ⚙️ Additional Features
- **Responsive Design**: Optimized for mobile devices with a clean, intuitive interface
- **Dark Mode**: Toggle between light and dark themes
- **Interactive Starfield Background**: Immersive space environment

## Technologies Used
- HTML5
- CSS3
- JavaScript
- Three.js (for 3D visualizations)
- RESTful APIs for live data

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/kingze1l/CS104-.git
```

2. Navigate to the project directory:
```bash
cd CS104-
```

3. Open the main HTML file in your browser:
```bash
open "1 SpaceProject.html"   # on macOS
# OR
start "1 SpaceProject.html"  # on Windows
```

## File Structure

```
├── 1 SpaceProject.html      # Main home page
├── 2 About.html             # Planet explorer page
├── iss-tracker.html         # ISS tracking page
├── Style.css                # Main stylesheet
├── about.css                # Planet explorer stylesheet
├── iss-tracker.css          # ISS tracker stylesheet
├── space-background.css     # Starfield background styles
├── animated-cards.css       # Animation styles for cards
├── Script.js                # Main JavaScript file
├── mainM.js                 # Additional main JavaScript functionality
├── about.js                 # Planet explorer functionality
├── iss-tracker.js           # ISS tracking functionality
├── space-background.js      # Starfield background animation
└── dark-mode.js             # Theme switching functionality
```

## API Integration

This application integrates with several APIs:
- ISS location tracking API for real-time position data
- NASA Open APIs for mission information and imagery
- Space Launch API for upcoming rocket launches

## Future Enhancements

- User authentication for personalized experiences
- Push notifications for ISS passes over user location
- Augmented reality features for planet visualization
- More detailed mission information and timelines

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [NASA](https://www.nasa.gov/) for their open data and inspiration
- [Where the ISS at API](https://wheretheiss.at/w/developer) for ISS tracking data
- [Three.js](https://threejs.org/) for 3D globe visualization
- [SpaceX API](https://github.com/r-spacex/SpaceX-API) for launch information

---

*This project was created as part of CS104 coursework and is not officially affiliated with NASA.*
