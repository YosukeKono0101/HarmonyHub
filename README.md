# HarmonyHub

## Overview

HarmonyHub is a web application designed for music enthusiasts. It provides a platform to find artist information, discover top tracks and albums, and explore upcoming concerts. Additionally, it recommends nearby restaurants and bars close to concert venues, enhancing the overall concert-going experience.

# Features

- **Explore Artist Info**: Search for artists to get detailed information including top tracks, albums, and similar artists.
- **Discover Concerts**: Enter a location or venue name to discover upcoming concerts and events.
- **Nearby Restaurants**: Get recommendations for nearby restaurants and bars around concert venues.
- **Wikipedia Integration**: Access Wikipedia information related to the searched artist.
- **Page Counter**: Keep track of page visits using an AWS S3 bucket (if
  AWS credentials are provided).

# Tech Stack

- **Frontend**: HTML, CSS (Bootstrap), JavaScript
- **Backend**: Node.js, Express.js
- **APIs**: LastFM, Ticketmaster, Google Places, Wikipedia
- AWS S3 for page counter functionality

# Installation and Setup

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies: npm install
4. Create a .env file in the root of the project and add your API keys: lastFM_api_key=YOUR_LASTFM_API_KEY
   ticketmaster_api_key=YOUR_TICKETMASTER_API_KEY
   googlePlaces_api_key=YOUR_GOOGLE_PLACES_API_KEY
5. Start the server: node server.js

# Running the Application

- Open your web browser and navigate to http://localhost:3000.
- Explore the features by entering artist names or locations for concert searches.

# Note

- Ensure you have Node.js installed on your system.
- API keys are required for LastFM, Ticketmaster, and Google Places to fetch data.
