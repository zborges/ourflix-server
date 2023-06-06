const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Movie = require("../models/movieModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const db = mongoose.connection;
//get movie by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.MOVIEDB_API_KEY}`;

  const options = {
    method: "GET",
    headers: {
      Authorization: process.env.Authorization,
      "Content-Type": process.env.Content_Type,
    },
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.log("error" + error));

  try {
    let response = await fetch(url, options);
    response = await response.json();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: `Internal Server Error.` });
  }
});

// get list of movies
router.get("/", async (req, res) => {
  const id = req.params.id;
  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

  const options = {
    method: "GET",
    headers: {
      Authorization: process.env.Authorization,
      "Content-Type": process.env.Content_Type,
    },
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.log("error" + error));

  try {
    let response = await fetch(url, options);
    response = await response.json();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: `Internal Server Error.` });
  }
});

// check if movie exists in database already and the userArray contains the userId of the user adding it
const doesMovieExist = async (req) => {
  try {
    const searchedMovie = await Movie.findOne({ movieId: req.movieId });
    if (searchedMovie == null) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log("error", error);
    return false;
  }
};

const doesUserExist = async (req) => {
  try {
    const searchedMovie = await Movie.findOne({ movieId: req.movieId });
    const userArray = searchedMovie.users;
    let result = false;
    userArray.forEach((userId) => {
      if (userId.toString() === req.users[0]) {
        result = true;
      }
    });
    console.log("result", result);
    return result;
  } catch (error) {
    console.log("error", error);

    return false;
  }
};

const addMovieToUser = async (user, movie) => {
  return User.findByIdAndUpdate(
    user._id,
    { $push: { movies: movie._id } },
    { new: true, useFindAndModify: false }
  );
};

const addUserToMovie = async (user, movie) => {
  return Movie.findByIdAndUpdate(
    movie._id,
    { $push: { users: user._id } },
    { new: true, useFindAndModify: false }
  );
};

// add movie to list
router.post("/", async (req, res) => {
  const { movie } = req.body;
  const searchedMovie = await Movie.findOne({ movieId: movie.movieId });
  const searchedUser = await User.findOne({ _id: req.body.user.id });

  // check to see if movie exists in database.
  if (await doesMovieExist(movie)) {
    // if it does, check to see if user exists in the userArray of the movie
    if ((await doesUserExist(movie)) == true) {
      return res.status(400).json({
        message: "User already has movie saved.",
        movieId: movie.movieId,
      });
    } else {
      // if user does not exist in userArray, add user to userArray and add movie to user's movie list
      addMovieToUser(searchedUser, searchedMovie);
      addUserToMovie(searchedUser, searchedMovie);

      return res
        .status(201)
        .json({ message: "Movie would be added to User's profile" });
    }
  } else {
    const newMovie = await Movie.create(movie);

    await User.updateMany(
      { _id: { $in: newMovie.users } },
      { $push: { movies: newMovie._id } }
    );

    return res
      .status(201)
      .json({ message: "Movie created successfully", newMovie });
  }
});

module.exports = router;
