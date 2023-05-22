const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Movie = require("../models/movieModel");
const userModel = require("../models/userModel");

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

// add movie to list
router.post("/", async (req, res) => {
  const { movie } = req.body;

  if (!movie || Movie.findOne({ movieId: movie.movieId })) {
    return res.status(400).json({ message: "Movie already exists" });
  } else {
    const newMovie = await Movie.create(movie);
    await userModel.updateMany(
      { _id: { $in: newMovie.users } },
      { $push: { movies: newMovie._id } }
    );
    return res
      .status(201)
      .json({ message: "Movie created successfully", newMovie });
  }
});

module.exports = router;
