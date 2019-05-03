var express = require('express');

const User = require('../models/users')
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post("/signup", (req, res, next) => {
  User.findOne({
    username: req.body.username
  }).then(user => {
    if (user != null) {
      let err = newError("User " + req.body.username + " already exists!");
      err.status = 403;
      return next(err);
    } else {
      return User.create({
        username: req.body.username,
        password: req.body.password,
        admin: req.body.admin
      });
    }
  }).then(user => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      status: "Registration Successful",
      user: user
    });
  }, err => next(err)).catch(err => next(err));
});


router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    let err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

module.exports = router;