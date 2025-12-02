## Movie API Project

A RESTful API built with Node.js, Express, and MongoDB for managing movies, users, and authentication.
This API serves as the backend for the myFlix web application, supporting both Angular and React clients.

---

## Project Context (Achievement 2 – CareerFoundry)

This project is part of Achievement 2 of the CareerFoundry Full-Stack Web Development Program.
The main objective is to build the server-side component of a movies web application, providing:

- Access to information about movies, directors, and genres
- User registration and profile management
- Favorite movies list management
- By completing this project, you demonstrate your ability to create and manage REST APIs, implement authentication/authorization, secure data, and build a backend architecture ready to integrate with a frontend application.

Target users:

- Frontend developers (for the client-side integration)
- Movie enthusiasts who want easy access to movie information

---

### Essential Features Implemented

- Return a list of all movies
- Return detailed data for a single movie (title, description, genre, director, image URL, featured flag)
- Return data about genres and directors
- User registration, login, profile update, and deregistration
- Add/remove movies from a user's favorites
- Secure password storage with bcrypt
- JWT token-based authentication
- Data validation and error-free operations

Optional / Bonus Features:
- Viewing actors for each movie
- Viewing release dates and ratings
- “To Watch” list in addition to favorites

---

### Technologies Used

- Node.js & Express
- MongoDB & Mongoos
- JWT for authenticatio
- Bcrypt for password hashin
- CORS for cross-origin request
- TypeDoc for automatic API doumentation
- Postman for testing endpoints

---

### Authentication

- JWT tokens are issued upon login or registration
- Frontend clients use tokens to make authenticated requests
- Tokens and username can be stored in localStorage on the client side

---

## Live Links

- **Live App (frontend + backend)**: https://movie-api-2025-9f90ce074c45.herokuapp.com/
- **API Docs**: https://movie-api-2025-9f90ce074c45.herokuapp.com/documentation.html
- **Postman Collection**: Included in project files (`postman_req` folder)
- **GitHub Repo**: https://github.com/ghostmaruko/movie_api

### Backend Endpoints (JWT required for most requests)

Base URL: `https://myflix-api-0vxe.onrender.com`

- `POST /users` — Register a new user (no token required)  
  Example: `https://myflix-api-0vxe.onrender.com/users`

- `POST /login` — Login to get JWT token  
  Example: `https://myflix-api-0vxe.onrender.com/login`

- `GET /movies` — List all movies (**temporarily public for frontend development**)  
  Example: `https://myflix-api-0vxe.onrender.com/movies`  
  (This endpoint is temporarily public; in production it will require JWT.)

- `GET /movies/:title` — Get movie by title (requires JWT)  
  Example: `https://myflix-api-0vxe.onrender.com/movies/Inception`

- `GET /genres/:name` — Get genre info (requires JWT)  
  Example: `https://myflix-api-0vxe.onrender.com/genres/Action`

- `GET /directors/:name` — Get director info (requires JWT)  
  Example: `https://myflix-api-0vxe.onrender.com/directors/Christopher%20Nolan`

- `POST /users/:username/movies/:movieID` — Add movie to favorites (requires JWT)  
- `DELETE /users/:username/movies/:movieID` — Remove movie from favorites (requires JWT)  
- `PUT /users/:username` — Update user info (requires JWT)  
- `DELETE /users/:username` — Delete user (requires JWT)  

**Authentication:** All routes (except `POST /users` and `POST /login`) require JWT authentication.  
**Authorization:** Passport.js with Local and JWT strategies.  
**Passwords:** Hashed using bcrypt.  
**Testing:** All endpoints tested with Postman.
---

## Frontend

⚠️ **Note:** This project no longer includes a frontend served via Express.  
The frontend has been moved to a separate project built with **React**:  
[myFlix-client (React Frontend)](https://github.com/ghostmaruko/myFlix_client)

All API endpoints (e.g., `/users`, `/movies`) are now **exclusively accessed by the frontend React app** or API clients (e.g., Postman, curl).

To test the backend manually, use Postman with a valid JWT token.

---

## Project Structure

- index.js – main entry point, server setup, route registration, middleware, and TypeDoc integration
- models/ – Mongoose models for Movies and Users
- routes/ – Express routes for API endpoints
- controllers/ – business logic for each route
- docs/ – TypeDoc generated documentation
- package.json – project dependencies and scripts

---

## Notes on Testing the Backend

⚠️ Important: All protected API endpoints require a JWT token. You cannot directly test them via a browser. Use Postman (or another HTTP client) with the token to access routes like /users, /movies/:title, etc.

## Example endpoints

## Endpoint Method Notes

    /users	                                    POST	                  Register a new user
    /login	                                    POST	                  Login to get JWT
    /movies	                                    GET	                    Returns all movies (requires JWT)
    /movies/:title	                            GET	                    Returns a movie by title (requires JWT)
    /users/:username/movies/:movieID	          POST / DELETE	          Add/remove favorites (requires JWT)

## Testing steps:

Register a user via POST /users.
Login via POST /login to receive a JWT token.
In Postman, set Authorization → Bearer Token with the received JWT.
Test protected endpoints like /users, /movies, /users/:username/movies/:movieID.

---

## Deployment

✅ MongoDB Atlas connected via Mongoose  
✅ Environment variables used (`CONNECTION_URI`, `PORT`)  
✅ App deployed to Heroku  
✅ CORS enabled for all origins  
✅ All endpoints fully tested and verified

---

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT (Authentication)
- bcrypt (Password hashing)
- express-validator (Data validation)
- CORS
- Morgan
- Postman

---

## Screenshots & Postman

All API requests tested in Postman.

Screenshots of successful requests are included in the screenshots/ folder.

Full Postman collection is included in postman_req/ for direct import.

---

## Development Notes

- Password hashing applied on registration and login
- Data validation added using `express-validator`
- All API features from Achievement 2 and 3 implemented
- Images served statically with path normalization
- Postman collection and screenshots included for API testing
- Documentation updated with full endpoint details and example requests/responses

---

## 🚀 Deployment

The API is deployed on **Render** and publicly accessible at:

- [https://myflix-api-0vxe.onrender.com](https://myflix-api-0vxe.onrender.com)

For local development, follow the installation steps above.

---

## Author

Marco Esu – 2025
