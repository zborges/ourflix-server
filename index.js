const express = require("express");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = 3000;
app.use(express.json())

const movies = require("./routes/movieRoutes.js");
app.use("/movies", movies)

const users = require("./routes/userRoutes.js");
app.use("/users", users)

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected to Database Successfully");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
  res.json({ message: "Welcome to the home page!" });
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
