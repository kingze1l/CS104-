const apiKey = "COjts7snVqyUL9OD04ukQA==sHTQPO0uLGRS46bQ";
      const planetNames = [
        "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
      ];

      let planetsData = [];

      async function fetchPlanets() {
        const resultContainer = document.getElementById("result");
        resultContainer.innerHTML = `<div class="spinner"></div>`; // Show spinner

        try {
          const promises = planetNames.map((planetName) =>
            fetch(`https://api.api-ninjas.com/v1/planets?name=${planetName}`, { headers: { "X-Api-Key": apiKey } })
              .then((response) => response.json())
              .then((data) => data[0] || null)
              .catch(() => null)
          );

          planetsData = await Promise.all(promises);
          displayPlanets(planetsData);
        } catch (error) {
          console.error("Error fetching planet data", error);
          resultContainer.innerHTML = `<p>Failed to load planet data.</p>`;
        }
      }

      function displayPlanets(planets) {
        let output = planets
          .map((planet) => {
            if (!planet) return `<p>Error fetching planet data.</p>`;

            const temperatureCelsius = (planet.temperature - 273.15).toFixed(2);
            return `
  <div class="card">
    <div class="card-body">
      <h3>${planet.name}</h3>
      <p><strong>Mass:</strong> ${planet.mass} Earth masses</p>
      <p><strong>Radius:</strong> ${planet.radius} Earth radii</p>
      <p><strong>Temperature:</strong> ${temperatureCelsius} °C</p>
    </div>
    <div class="card-footer">
      <button class="more-info-btn" onclick="openModal('${planet.name}', '${planet.mass}', '${planet.radius}', '${temperatureCelsius}', '${planet.period}', '${planet.semi_major_axis}', '${planet.distance_light_year}', '${planet.host_star_mass}', '${planet.host_star_temperature}')">
        Show More Info
      </button>
    </div>
  </div>`;
          })
          .join("");

        document.getElementById("result").innerHTML = output;
      }

      function filterPlanets() {
        const searchValue = document.getElementById("planetSearch").value.toLowerCase();
        const filteredPlanets = planetsData.filter((planet) =>
          planet && planet.name.toLowerCase().includes(searchValue)
        );
        displayPlanets(filteredPlanets);
      }

      function openModal(name, mass, radius, temperature, period, semi_major_axis, distance_light_year, host_star_mass, host_star_temperature) {
        const modal = document.getElementById("planetModal");
        const modalContent = document.getElementById("modalContent");

        modalContent.innerHTML = `
          <h2>${name}</h2>
          <p><strong>Mass:</strong> ${mass} Earth masses</p>
          <p><strong>Radius:</strong> ${radius} Earth radii</p>
          <p><strong>Temperature:</strong> ${temperature} K</p>
          <p><strong>Orbital Period:</strong> ${period} Earth days</p>
          <p><strong>Semi-Major Axis:</strong> ${semi_major_axis} AU</p>
          <p><strong>Distance from Earth (light-years):</strong> ${distance_light_year} light-years</p>
          <p><strong>Host Star Mass:</strong> ${host_star_mass} Solar masses</p>
          <p><strong>Host Star Temperature:</strong> ${host_star_temperature} K</p>
          <iframe src="https://eyes.nasa.gov/apps/solar-system/#/${name.toLowerCase()}?embed=true&logo=false" allowfullscreen></iframe>
        `;
        modal.style.display = "flex";
      }

      function closeModal() {
        const modal = document.getElementById("planetModal");
        modal.style.display = "none";
      }

      function toggleSearch() {
        const searchSection = document.getElementById("searchSection");
        searchSection.style.display = searchSection.style.display === "none" || searchSection.style.display === "" ? "block" : "none";
      }

      window.onload = fetchPlanets;