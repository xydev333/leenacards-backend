const express = require("express");
const request = require("request");


const router = express.Router();

const WEB_URL = "http://62.171.146.121:1198";
const KNET_SECRET = "kWdSzHtYvsHh29y4S5s9f5Fn";


router.all("/", async (req, res) => {
  // console.log("!!!!!!!!!!knet payment response", req.body, req.params);
});


router.get("/success", (req, res) => {
  res.send("Success");
});

router.get("/fail", (req, res) => {
  res.send("Fail");
});

module.exports = router;
