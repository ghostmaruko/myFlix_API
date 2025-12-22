// =================== IMPORTS ===================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const Models = require("./moongose/model.js");
const cors = require("cors");
require("dotenv").config();

const Movie = Models.Movie;
const User = Models.User;

const { check, validationResult } = require("express-validator");
const path = require("path");

// =================== APP ===================
const app = express();

// Serve immagini dalla cartella public/img
app.use("/img", express.static(path.join(__dirname, "public/img")));

// =================== DATABASE ===================
mongoose
  .connect(process.env.CONNECTION_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =================== CORS ===================
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://movie-api-2025-9f90ce074c45.herokuapp.com",
  "https://myflixplore.netlify.app",
  "https://my-flix-client-hob19ly7a-ghostmarukos-projects.vercel.app",
  "https://myflix-api-0vxe.onrender.com",
  "https://my-flix-client-tau.vercel.app",
  "https://myflix-client-angular.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        console.warn(`Blocked CORS for origin: ${origin}`);
        return callback(
          new Error(`CORS policy blocks access from ${origin}`),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// =================== MIDDLEWARE ===================
app.use(express.json());
app.use(passport.initialize());

// =================== AUTH ===================
require("./auth")(app);

// =================== TYPEDEFS ===================
/**
 * @typedef {Object} Movie
 * @property {string} _id - ID del film
 * @property {string} title - Titolo del film
 * @property {string} description - Descrizione del film
 * @property {Object} director - Info sul regista
 * @property {string} director.name - Nome regista
 * @property {string} director.bio - Bio regista
 * @property {Object} genre - Info sul genere
 * @property {string} genre.name - Nome genere
 * @property {string} genre.description - Descrizione genere
 * @property {string} imageURL - URL immagine
 */

/**
 * @typedef {Object} User
 * @property {string} _id - ID utente
 * @property {string} username - Nome utente
 * @property {string} email - Email utente
 * @property {string} birthday - Data di nascita
 * @property {Array<string>} favoriteMovies - Lista film preferiti
 */

// =================== ROUTES ===================

/**
 * @route POST /users
 * @group Users - Operations about users
 * @summary Register a new user
 * @param {string} username.body.required - Username
 * @param {string} password.body.required - Password
 * @param {string} email.body.required - Email
 * @param {string} [birthday.body] - Data di nascita
 * @returns {User.model} 201 - User created
 * @returns {Error} 400 - Username already exists
 * @returns {Error} 422 - Validation errors
 * @returns {Error} 500 - Unexpected error
 */
app.post(
  "/users",
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check("username", "Username must be alphanumeric").isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email is not valid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    try {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser)
        return res.status(400).send(`${req.body.username} already exists`);

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = await User.create({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        birthday: req.body.birthday,
      });

      res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route GET /movies
 * @group Movies - Operations about movies
 * @summary Get all movies
 * @returns {Array<Movie>} 200 - List of all movies
 * @returns {Error} 500 - Unexpected error
 */
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    const updatedMovies = movies.map((movie) => {
      const m = movie.toObject();
      if (m.imageURL && !m.imageURL.startsWith("http")) {
        m.imageURL = `https://myflix-api-0vxe.onrender.com/img/${m.imageURL}`;
      }
      return m;
    });
    res.json(updatedMovies);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

/**
 * @route GET /movies/{title}
 * @group Movies - Operations about movies
 * @param {string} title.path.required - Movie title
 * @returns {Movie.model} 200 - Movie object
 * @returns {Error} 404 - Movie not found
 * @returns {Error} 500 - Unexpected error
 */
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movie.findOne({ title: req.params.title });
      if (!movie) return res.status(404).send("Movie not found");
      res.json(movie);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route GET /genres/{name}
 * @group Genres - Operations about genres
 * @param {string} name.path.required - Genre name
 * @returns {Object} 200 - Genre object
 * @returns {Error} 404 - Genre not found
 * @returns {Error} 500 - Unexpected error
 */
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movie.findOne({ "genre.name": req.params.name });
      if (!movie) return res.status(404).send("Genre not found");
      res.json(movie.genre);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route GET /directors/{name}
 * @group Directors - Operations about directors
 * @param {string} name.path.required - Director name
 * @returns {Object} 200 - Director object
 * @returns {Error} 404 - Director not found
 * @returns {Error} 500 - Unexpected error
 */
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movie.findOne({ "director.name": req.params.name });
      if (!movie) return res.status(404).send("Director not found");
      res.json(movie.director);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route GET /users
 * @group Users - Operations about users
 * @returns {Array<User>} 200 - List of users
 * @returns {Error} 500 - Unexpected error
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route GET /users/{username}
 * @group Users - Operations about users
 * @param {string} username.path.required - Username
 * @returns {User.model} 200 - User object
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Unexpected error
 */
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.username !== req.params.username)
      return res.status(400).send("Permission denied");

    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).send("User not found");
      res.json(user);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route PUT /users/{username}
 * @group Users - Operations about users
 * @param {string} username.path.required - Username
 * @param {User.model} user.body.required - User data to update
 * @returns {User.model} 200 - Updated user
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Unexpected error
 */
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.username !== req.params.username)
      return res.status(400).send("Permission denied");

    try {
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        { $set: req.body },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send("User not found");
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route POST /users/{username}/movies/{MovieID}
 * @group Users - Favorite Movies
 * @param {string} username.path.required - Username
 * @param {string} MovieID.path.required - Movie ID
 * @returns {User.model} 200 - Updated user with new favorite
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Unexpected error
 */
app.post(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.username !== req.params.username)
      return res.status(400).send("Permission denied");

    try {
      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        { $addToSet: { favoriteMovies: req.params.MovieID } },
        { new: true }
      );
      if (!updatedUser) return res.status(404).send("User not found");
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route DELETE /users/{username}/movies/{MovieID}
 * @group Users - Favorite Movies
 * @param {string} username.path.required - Username
 * @param {string} MovieID.path.required - Movie ID
 * @returns {User.model} 200 - Updated user with movie removed
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Unexpected error
 */
app.delete(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.username !== req.params.username)
      return res.status(400).send("Permission denied");

    try {
      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        { $pull: { favoriteMovies: req.params.MovieID } },
        { new: true }
      );
      if (!updatedUser) return res.status(404).send("User not found");
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @route DELETE /users/{username}
 * @group Users - Operations about users
 * @param {string} username.path.required - Username
 * @returns {string} 200 - Deletion message
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Unexpected error
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const usernameParam = req.params.Username.toLowerCase();

    if (req.user.username.toLowerCase() !== usernameParam)
      return res.status(400).send("Permission denied");

    try {
      const user = await User.findOneAndDelete({
        username: usernameParam,
      });
      if (!user) return res.status(404).send("User not found");
      res.send(`${req.params.Username} was deleted.`);
    } catch (err) {
      res.status(500).send("Error: " + err);
    }
  }
);

// =================== ROOT ===================
/**
 * @route GET /
 * @group Root
 * @returns {Object} 200 - API status message
 */
app.get("/", (req, res) => {
  res.json({ message: "myFlix API is running" });
});

// =================== ERROR HANDLER ===================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// =================== SERVER ===================
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
