const moment = require("moment");

function isValidDateFormat(dateString) {
  return moment(dateString, "YYYY-MM-DD", true).isValid();
}

function validAllUserCanSeat(users, maxSeat) {
  if (users.length > maxSeat) {
    return false;
  }
  return true;
}
module.exports = { isValidDateFormat, validAllUserCanSeat };
