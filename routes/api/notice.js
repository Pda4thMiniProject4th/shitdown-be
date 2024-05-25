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

//notice에서 rearrange_at 필드 값 추출해서 메인페이지에 공지
router.get("/mainpage/:orders", async (req, res) => {
  const ordersValue = req.params.orders;
  try {
    const rearrange_at = await Notice.findOne(
      { orders: ordersValue },
      "rearrange_at -_id"
    );
    res.json(rearrange_at);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching rearrange_at");
  }
});

module.exports = router;
