const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    rearrange_at: {
      type: Date,
      required: true,
    },
    orders: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
