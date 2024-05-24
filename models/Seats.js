const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    user_seat: [
      {
        type: Object,
        required: true,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Seat = mongoose.model("Seat", seatSchema);

module.exports = Seat;
