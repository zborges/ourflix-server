import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/movies/:id", async (req, res) => {
  const id = req.params.id;
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=bae312498d3a8b81ad008ff536e8b737`;

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

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else {
    console.log("Error occurred, server can't start", error);
  }
});
