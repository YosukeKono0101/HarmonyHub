// Function to fetch data from the server API
function fetchData(searchTerm, callback) {
  fetch(`/search?term=${searchTerm}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert(data.error);
        throw new Error(data.error);
      }
      callback(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("No matches found for your search term! Please Try Again");
    });
}

// Function to fetch and display artist and Wikipedia data
function fetchArtistAndWikiData() {
  // Retrieve the search term from the input box
  const searchTerm = document.getElementById("artistSearchBox").value;

  // Fetch the data using the fetchData function
  fetchData(searchTerm, (data) => {
    const { artist, track, album } = data;

    // Display artist details on the page
    document.getElementById("artistName").textContent = artist.name;
    document.getElementById("artistListeners").textContent = `Listeners: ${artist.listeners}`;
    document.getElementById("artistUrl").setAttribute("href", artist.url);
    document.getElementById("artistUrl").style.display = "block";
    document.getElementById("similarArtists").textContent = `Similar Artists: ${artist.similarArtists}`;
    document.getElementById("topTracks").textContent = `Top Tracks: ${track.topTracks}`;
    document.getElementById("topAlbums").textContent = `Top Albums: ${album.topAlbums}`;

    // Display Wikipedia information
    if (data.wiki) {
      const description = data.wiki.extract;
      document.getElementById("wikiInfoTitle").style.display = "block";
      document.getElementById("wikiInfo").textContent = description;
    } else {
      document.getElementById("wikiInfo").textContent = "No information found on Wikipedia.";
    }
  }).catch((error) => {
    console.error("Error:", error);
  });
}

// Function to fetch and display concert and nearby places data
function fetchConcertAndNearByPlacesData() {
  // Retrieve the search term from the input box
  const searchTerm = document.getElementById("concertSearchBox").value;

  // Fetch the data using the fetchData function
  fetchData(searchTerm, (data) => {
    // Take the first concert from the received data
    const concert = data.concerts[0];

    // Display concert details on the page
    document.getElementById("concertName").textContent = concert.name;
    document.getElementById("concertDate").textContent = `Date: ${concert.date}`;
    document.getElementById("concertVenue").textContent = `Venue: ${concert.venue}`;
    document.getElementById("concertCity").textContent = `City: ${concert.city}`;
    document.getElementById("concertCountry").textContent = `Country: ${concert.country}`;

    // Display nearby restaurants
    document.getElementById("restaurantNearVenueTitle").style.display = "block";
    const placesList = document.getElementById("placesList");
    placesList.innerHTML = "";

    // Loop through the list of nearby places and display them
    data.googlePlaces.slice(0, 5).forEach((place) => {
      let placeItem = document.createElement("li");

      // Display the place name
      let placeName = document.createElement("div");
      placeName.textContent = `Name: ${place.name}`;
      placeItem.appendChild(placeName);

      // Display the address
      if (place.vicinity) {
        let placeAddress = document.createElement("div");
        placeAddress.textContent = `Address: ${place.vicinity}`;
        placeItem.appendChild(placeAddress);
      }

      // Display the type of food
      if (place.types) {
        //Getting rid of 'point of interest' and 'establishment'
        const filteredTypes = place.types.filter((type) => type !== "point_of_interest" && type !== "establishment");

        if (filteredTypes.length > 0) {
          let placeType = document.createElement("div");
          placeType.textContent = `Type: ${filteredTypes.join(", ")}`;
          placeItem.appendChild(placeType);
        }
      }
      // Add the place item to the list
      placesList.appendChild(placeItem);
    });
  }).catch((error) => {
    console.error("Error:", error);
  });
}

window.addEventListener("load", () => {
  fetch("/getCounter")
    .then((response) => response.json())
    .then((data) => {
      const counterElement = document.getElementById("counter");
      counterElement.textContent = data.counter;
    })
    .catch((error) => {
      console.error("Error fetching the counter:", error);
    });
});
