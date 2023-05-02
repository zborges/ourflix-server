const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        return res.status(200).json({ message: "User Logged in Successfully" });
      }
      console.log(err);
      return res.status(401).json({ message: "Invalid Credentials" });
    });
  } catch (error) {
    res.status(401).send(err.message);
  }
});

module.exports = router;
