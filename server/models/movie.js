const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const Schema = mongoose.Schema;
mongoose.plugin(slug);

const Movies = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    PosterPath: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["MOVIE", "SERIES"],
      required: true,
    },
    TotalEpisodes: {
      type: Integer,
      required: true,
      default: 0,
    },
    ReleaseDate: {
      type: Date,
    },
    CountryId: { type: Integer },
    Language: { type: String },
    Overview: { type: String },
    Viewed: { type: Integer },
    CreatedAt: { type: DateTime },
  },
  {
    timestamps: true,
  }
);

Movies.index({ name: "text" });

module.exports = mongoose.model("movies", Movies);
