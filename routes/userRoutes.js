const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/sign-up", async (req, res) => {
  try {
    const { email, password } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists) {
      res.status(401).json({ message: " Email is already in use." });
      return;
    }
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) throw new Error("Internal Server Error");
      let user = new User({
        email,
        password: hash,
      });
      user.save().then(() => {
        res.json({ message: "User created successfully", user });
      });
    });
  } catch (err) {
    return res.status(401).send(err.message);
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const accessToken = jwt.sign(
      JSON.stringify(user.email),
      process.env.TOKEN_SECRET,
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        return res.status(200).json({ accessToken: accessToken });
      }
      console.log(err);
      return res.status(401).json({ message: "Invalid Credentials" });
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;
