var express = require("express");
const Notice = require("../../models/Notices");
const { isValidDateFormat } = require("../../valid/Valid");

const router = express.Router();

/**
 * Notice 변경 API
 * @method POST
 *
 * @default ~/notice/
 *
 * @param {
 * requestBody : {
 *  rearrange_at : Date.format(%YYYY-%MM-%dd)(ex. "2024-04-02"),
 *  orders : Number (ex. 3)
 * }
 * }
 *
 * @returns {
 * success: {
 *  status: "success",
 *  message: "ok",
 * } ||
 * fail: {
 *  status: "fail",
 *  message: error.message,
 * }
 * }
 */
router.post("/", async (req, res, next) => {
  try {
    if (!isValidDateFormat(req.body.rearrange_at)) {
      throw new Error("Date type is not invalid");
    }
    await Notice.findOneAndUpdate(
      { orders: req.body.orders },
      { $set: req.body },
      { upsert: true }
    );
    res.status(200).json({
      status: "success",
      message: "ok",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
});

module.exports = router;
