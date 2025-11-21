// =================== IMPORTS ===================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport"); // correggo import
const Models = require("./moongose/model.js");
const cors = require("cors");
require("dotenv").config();

const Movie = Models.Movie;
const User = Models.User;

console.log("CONNECTION_URI =", process.env.CONNECTION_URI);

// =================== APP ===================
const app = express();

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
<<<<<<< HEAD
  "https://movie-api-2025-9f90ce074c45.herokuapp.com",
  "https://myflixplore.netlify.app"
=======
  "https://my-flix-client-hob19ly7a-ghostmarukos-projects.vercel.app",
  "https://myflixplore.netlify.app",
  "https://myflix-api-0vxe.onrender.com", // aggiunta
>>>>>>> 8e70f67 (fix cors problem)
];

app.use(
  cors({
    origin: (origin, callback) => {
<<<<<<< HEAD
      if (!origin) return callback(null, true);
=======
      if (!origin) return callback(null, true); // richieste Postman / server-side
>>>>>>> 8e70f67 (fix cors problem)
      if (allowedOrigins.indexOf(origin) === -1) {
        console.warn(`Blocked CORS for origin: ${origin}`);
        return callback(new Error(`CORS policy blocks access from ${origin}`), false);
      }
      return callback(null, true);
    },
    credentials: true, // permette cookie/session
  })
);

// =================== MIDDLEWARE ===================
app.use(express.json());
app.use(passport.initialize());

// =================== LOGIN / REGISTER ===================
require("./auth")(app);

// =================== ROUTES ===================
<<<<<<< HEAD

// ===== 1. Registrazione nuovo utente =====
=======
// --- Registrazione nuovo utente ---
>>>>>>> 8e70f67 (fix cors problem)
app.post(
  "/users",
  [
    check("username", "Username is required").isLength({ min: 5 }),
<<<<<<< HEAD
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
=======
    check("username", "Username must be alphanumeric").isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email is not valid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
>>>>>>> 8e70f67 (fix cors problem)

    try {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) return res.status(400).send(`${req.body.username} already exists`);

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

<<<<<<< HEAD
// ===== 2. Ottieni tutti i film (pubblica per il progetto) =====
=======
// --- Ottieni tutti i film (PUBBLICA) ---
>>>>>>> 8e70f67 (fix cors problem)
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
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

<<<<<<< HEAD
// ===== 6. Aggiorna utente =====
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

// ===== 7. Aggiungi film ai preferiti =====
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

// ===== 8. Rimuovi film dai preferiti =====
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

// ===== 9. Cancella utente =====
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

// ===== 10. Leggi tutti gli utenti =====
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

// ===== 11. Leggi utente specifico =====
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

// ===== 12. Root API message (NO STATIC FILES) =====
app.get("/", (req, res) => {
  res.json({ message: "myFlix API is running" });
});

// ===== ERROR HANDLER =====
=======
// =================== ERROR HANDLER ===================
>>>>>>> 8e70f67 (fix cors problem)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// =================== LISTENER ===================
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
