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
    orders: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Seat = mongoose.model("Seat", seatSchema);

module.exports = Seat;
