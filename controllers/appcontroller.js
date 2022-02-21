const moment = require("moment");

class AppController {
  constructor() {}

  getDate() {
    var d = new Date();
    return (
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("-") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":")
    );
  }
}

export default AppController;
