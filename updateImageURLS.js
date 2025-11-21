// updateImageURLs.js
const mongoose = require("mongoose");
require("dotenv").config();
const Models = require("./moongose/model.js");
const Movie = Models.Movie;

// nuovo dominio (Render)
const BASE_URL = "https://myflix-api-0vxe.onrender.com/img/";

async function updateImageURLs() {
  try {
    await mongoose.connect(process.env.CONNECTION_URI);
    console.log("Connected to MongoDB");

    const movies = await Movie.find();

    for (const movie of movies) {
      if (!movie.imageURL) continue;

      // prendiamo solo il nome del file (es. star_wars.jpg)
      const filename = movie.imageURL.split("/").pop();

      // aggiorniamo l'URL
      movie.imageURL = BASE_URL + filename;

      await movie.save();

      console.log(`Updated: ${movie.title} → ${movie.imageURL}`);
    }

    console.log("All imageURLs updated!");
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

updateImageURLs();

//######################################################################//

/* const fs = require("fs");
const path = require("path");

// Percorso del file JSON dei film
const moviesFilePath = path.join(__dirname, "movies.json");

// URL base delle immagini sul tuo backend Heroku
const baseURL = "https://movie-api-2025-9f90ce074c45.herokuapp.com/img/";

// Leggi il JSON dei film
let movies = JSON.parse(fs.readFileSync(moviesFilePath, "utf-8"));

// Aggiorna imageURL per ogni film
movies = movies.map((movie) => {
  return {
    ...movie,
    imageURL: baseURL + movie.imageURL,
  };
});

// Salva su un nuovo file (puoi sovrascrivere quello vecchio se vuoi)
fs.writeFileSync(
  path.join(__dirname, "movies_with_full_img_url.json"),
  JSON.stringify(movies, null, 2),
  "utf-8"
);

console.log("imageURL aggiornati con successo!");
 */
