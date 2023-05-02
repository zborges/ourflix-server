const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

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

module.exports = router;
