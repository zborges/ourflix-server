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
    console.log("searchedMovie", searchedMovie);
    if (searchedMovie == null) {
      console.log("searchedMovie IS null");
      return false;
    } else {
      console.log("searchedMovie IS NOT null");

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
      console.log("start of forEach");
      if (userId.toString() === req.users[0]) {
        console.log("TRUE");
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
// WILL REFACTOR THIS LATER
const addMovieToUser = async (userId, movie) => {
  const searchedMovie = await Movie.findOne({ movieId: movie.movieId });
  const searchedUser = await User.findOne({ _id: userId });
  return User.findByIdAndUpdate(
    searchedUser._id,
    { $push: { movies: searchedMovie._id } },
    { new: true, useFindAndModify: false }
  );
};

const addUserToMovie = async (userId, movie) => {
  const searchedMovie = await Movie.findOne({ movieId: movie.movieId });
  const searchedUser = await User.findOne({ _id: userId });
  return Movie.findByIdAndUpdate(
    searchedMovie._id,
    { $push: { users: searchedUser._id } },
    { new: true, useFindAndModify: false }
  );
};
// need to have function that checks if user exists in the userArray of the movie
// if user exists, then don't add movie to list
// if user does not exist, then add movie to users list

// add movie to list
router.post("/", async (req, res) => {
  const { movie } = req.body;
  // check to see if movie exists in database.
  if (await doesMovieExist(movie)) {
    // If it does, check to see if user exists in the userArray of the movie
    if ((await doesUserExist(movie)) == true) {
      console.log("User already has movie saved.");
      return res.status(400).json({
        message: "User already has movie saved.",
        movieId: movie.movieId,
      });
    } else {
      console.log("User does not have movie saved.");
      const searchedMovie = await Movie.findOne({ movieId: movie.movieId });
      addMovieToUser(req.body.user.id, movie);
      addUserToMovie(req.body.user.id, movie);

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
    console.log("New movie would be created here.");
    return res
      .status(201)
      .json({ message: "Movie created successfully", newMovie });
  }
});

module.exports = router;
