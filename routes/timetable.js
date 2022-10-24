var express = require('express');
const { database } = require('../javascript/db');
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require('libphonenumber-js');
var router = express.Router();

router.get("/", function (req, res) {
    res.render('public/timetable/home')
})
router.get("/chooseTime", function (req, res) {
    res.render('public/timetable/chooseTime')
})
module.exports = router;
