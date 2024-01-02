// Import required modules
const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const AWS = require("aws-sdk");

//Pagecounter (can be used if AWS credentials provided)
/*
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

const s3 = new AWS.S3();
const BUCKET_NAME = "cab432-n11230380";
const COUNTER_KEY = "counter.json";

// Define a function to get the current page count from the S3 bucket.
async function getPageCount() {
  try {
    // Attempt to get the object from the S3 bucket containing the current page count.
    const data = await s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key: COUNTER_KEY,
      })
      .promise();

    // Convert the received data to a string and then to an integer, returning 0 if it fails.
    return parseInt(data.Body.toString("utf-8")) || 0;
  } catch (error) {
    // Check if the error is because the key doesn't exist.
    if (error.code === "NoSuchKey") {
      // If the key doesn't exist, create it with an initial count of 0.
      await s3
        .putObject({
          Bucket: BUCKET_NAME,
          Key: COUNTER_KEY,
          Body: "0",
        })
        .promise();

      // Return 0 as the page count since the key was just initialized.
      return 0;
    } else {
      // Log any other errors to the console.
      console.error("Error fetching counter:", error);
      // Return 0 to handle the error gracefully.
      return 0;
    }
  }
}
// Define a function to increment the page count.
async function incrementPageCount() {
  // Get the current page count.
  const currentCount = await getPageCount();
  // Increment the current count by 1.
  const newCount = currentCount + 1;

  // Update the object in the S3 bucket with the new count.
  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: COUNTER_KEY,
      Body: newCount.toString(),
    })
    .promise();

  // Return the updated count.
  return newCount;
}
*/

// Initialize Express app
const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.static("src"));

/*
app.get("/", async (req, res) => {
  let output = "Page Visits: " + (await incrementPageCount());
  res.send(output);
});
app.get("/getCounter", async (req, res) => {
  let count = await incrementPageCount();
  res.json({ counter: count });
});
*/

// Define search API endpoint
app.get("/search", async (req, res) => {
  // Extract the search term from the query parameters
  const searchTerm = req.query.term;
  // Read API keys from environment variables
  const lastFMApiKey = process.env.lastFM_api_key;
  const ticketmasterApiKey = process.env.ticketmaster_api_key;
  const googlePlacesApiKey = process.env.googlePlaces_api_key;
  // Initialize variables to hold API responses
  let lastFmData,
    ticketmasterData,
    wikimediaData,
    similarArtistsData,
    topTracksData,
    topAlbumsData;

  // Fetch data from LastFM API
  try {
    // Fetch artist information
    const responseLastFm = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${searchTerm}&api_key=${lastFMApiKey}&format=json`
    );
    lastFmData = await responseLastFm.json();

    // Fetch similar artists information
    const responseSimilarArtists = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&limit=2&artist=${searchTerm}&api_key=${lastFMApiKey}&format=json`
    );
    similarArtistsData = await responseSimilarArtists.json();

    // Fetch top tracks of the artist
    const responseTopTracks = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${searchTerm}&api_key=${lastFMApiKey}&format=json`
    );
    topTracksData = await responseTopTracks.json();

    // Fetch top albums of the artist
    const responseTopAlbums = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${searchTerm}&api_key=${lastFMApiKey}&format=json`
    );
    topAlbumsData = await responseTopAlbums.json();
  } catch (error) {
    console.error("Error occured in LastFM API:", error);
  }
  if (
    !lastFmData ||
    !lastFmData.results ||
    !lastFmData.results.artistmatches ||
    !lastFmData.results.artistmatches.artist ||
    lastFmData.results.artistmatches.artist.length === 0
  ) {
    return res.status(400).json({ error: "Artist not found!" });
  }
  // Fetch data from Ticketmaster API
  try {
    const responseTicketmaster = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?city=${searchTerm}&apikey=${ticketmasterApiKey}`
    );
    ticketmasterData = await responseTicketmaster.json();
  } catch (error) {
    console.error("Error occured in Ticketmaster API:", error);
  }

  // Fetch data from Wikipedia API
  try {
    // Wikipedia requires User-Agent header for API calls
    const headers = {
      "User-Agent": "Music & Artist Avenue/0.1",
    };
    const responseWikimedia = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${searchTerm}&limit=1`,
      {
        headers: headers,
      }
    );
    wikimediaData = await responseWikimedia.json();
    wikimediaData =
      wikimediaData.pages && wikimediaData.pages.length > 0
        ? wikimediaData.pages[0]
        : "Wiki information not available";

    // Fetch the summary (extract) for the Wikipedia page
    const extractURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikimediaData.title}`;
    const extractResponse = await fetch(extractURL, { headers: headers });
    const extractData = await extractResponse.json();
    wikimediaData.extract = extractData.extract || "No extract available";
  } catch (error) {
    console.error("Error occurred in Wikipedia API:", error);
  }

  // Fetch data from Google Places API
  let placesData = { results: [] };
  if (ticketmasterData?._embedded?.events?.[0]?._embedded?.venues?.[0]) {
    // Fetch latitude and longitude of the concert venue
    const venue = ticketmasterData._embedded.events[0]._embedded.venues[0];
    const latitude = venue.location.latitude;
    const longitude = venue.location.longitude;

    try {
      const responsePlaces = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=250&type=restaurant&key=${googlePlacesApiKey}`
      );
      placesData = await responsePlaces.json();
    } catch (error) {
      console.error("Error occurred in Google Places API:", error);
    }
  }

  // Format the data for sending back to the client
  const formattedData = {
    // LastFM data
    artist: {
      name: lastFmData.results.artistmatches.artist[0].name,
      listeners: lastFmData.results.artistmatches.artist[0].listeners,
      url: lastFmData.results.artistmatches.artist[0].url,
      similarArtists: similarArtistsData.similarartists.artist
        .map((a) => a.name)
        .join(", "),
    },
    track: {
      topTracks: topTracksData.toptracks.track
        .slice(0, 5)
        .map((a) => a.name)
        .join(", "),
    },
    album: {
      topAlbums: topAlbumsData.topalbums.album
        .slice(0, 5)
        .map((a) => a.name)
        .join(", "),
    },
    // Ticketmaster data
    concerts: ticketmasterData?._embedded?.events.map((event) => {
      const venue = event._embedded?.venues?.[0];
      return {
        name: event.name,
        date: event.dates.start.localDate,
        venue: venue?.name || "Venue information not available",
        address: venue?.address?.line1,
        city: venue?.city?.name || "City information not available",
        country: venue?.country?.name || "Country information not available",
        latitude: venue?.location?.latitude,
        longitude: venue?.location?.longitude,
      };
    }),
    // Google Places data
    googlePlaces: placesData.results,
    // Wikipedia data
    wiki:
      wikimediaData !== "Wiki information not available"
        ? {
            description: wikimediaData.description,
            url: "https://en.wikipedia.org/wiki/" + wikimediaData.key,
            extract: wikimediaData.extract,
          }
        : "Wiki information not available",
  };
  // Send the formatted data as JSON response
  res.json(formattedData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
