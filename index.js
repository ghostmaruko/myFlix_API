// =================== IMPORTS ===================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport"); // import corretto
const Models = require("./moongose/model.js");
const cors = require("cors");
require("dotenv").config();

const Movie = Models.Movie;
const User = Models.User;

console.log("CONNECTION_URI =", process.env.CONNECTION_URI);

// =================== APP ===================
const app = express();

const path = require("path");

// Serve immagini dalla cartella public/img
app.use("/img", express.static(path.join(__dirname, "public/img")));

// =================== DATABASE ===================
mongoose
  .connect(process.env.CONNECTION_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =================== VALIDATION ===================
const { check, validationResult } = require("express-validator");

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
];

/* app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // richieste Postman / server-side
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
); */

// test locale
app.use(cors({
  origin: "*",
  credentials: true
}));


// =================== MIDDLEWARE ===================
app.use(express.json());
app.use(passport.initialize());

// =================== LOGIN / REGISTER ===================
require("./auth")(app);

// =================== ROUTES ===================

// --- Registrazione nuovo utente ---
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

/* // --- Ottieni tutti i film (PUBBLICA) ---
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
}); */

// --- Ottieni tutti i film (PUBBLICA) con imageURL corretto ---
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    const updatedMovies = movies.map((movie) => {
      const m = movie.toObject(); // converte Mongoose doc in JS object
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

// --- Altre route protette ---
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

// GET genere e regista (protetti)
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

// --- Aggiorna utente ---
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.username !== req.params.username) {
      return res.status(400).send("Permission denied");
    }

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

// --- Aggiungi film ai preferiti ---
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
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

// --- Rimuovi film dai preferiti ---
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
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

// --- Cancella utente ---
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

// --- Leggi tutti gli utenti ---
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

// --- Leggi utente specifico ---
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

// --- Root API message ---
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
