const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    movieId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    CreatedAt: { type: DateTime, require: true, default: CURRENT_TIMESTAMP() },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comments", Comment);
