var express = require("express");
const User = require("../../models/Users");

const router = express.Router();

//mypage에서 id 필드 값으로 user의 profile, name, seat_option조회
router.get("/:id", async (req, res) => {
  //const idValue = req.params.id;
  try {
    const idValue = req.params.id;
    const user = await User.findOne(
      { id: idValue },
      "profile name seat_option -_id"
    );
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching");
  }
});

module.exports = router;
