const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Favorite = new Schema(
  {
    userId: { type: Integer, require: true },
    movieId: { type: Integer, ref: "movies", require: true },
    CreatedAt: { type: DateTime, require: true, default: CURRENT_TIMESTAMP() },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("favorites", Favorite);
