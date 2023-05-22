const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  movieId: Number,
  title: String,
  overview: String,
  image: String,
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Movie", movieSchema);
