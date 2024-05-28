const moment = require("moment");

function isValidDateFormat(dateString) {
  return moment(dateString, "YYYY-MM-DD", true).isValid();
}

function validAllUserCanSeat(users, maxSeat, prohibitLength) {
  console.log(maxSeat, prohibitLength);
  if (users.length > maxSeat - prohibitLength) {
    return false;
  }
  return true;
}
module.exports = { isValidDateFormat, validAllUserCanSeat };
