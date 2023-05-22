const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    validate: {
      validator: function (value){
        return value.length >= 2;
      },
      message: () => "First name is required",
    },
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    validate: {
      validator: function (value){
        return value.length >= 2;
      },
      message: () => `Last name is required`,
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: function (value) {
        return value.length >= 6;
      },
      message: () => "Password must be at least six characters long",
    },
  },
  movies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie"
    }
  ]
});
module.exports = mongoose.model("User", userSchema);
