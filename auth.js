var bodyParser = require('body-parser');
var User = require('./models/model-user');
var jwt = require('jsonwebtoken');

require("dotenv").config();

module.exports = (app) => {

  // post login
  app.post('/login', function(req, res, next) {
      console.log("arrived at login app.post");
    User
        .findOne({ username: req.body.username }, "+password", function(err, user) {
            if (!user) { return res.status(401).send({ message: 'Wrong username' }) };
        
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (!isMatch) {
                    return res.status(401).send({ message: 'Wrong password' });
                }
            
            let token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "60 days" });
        
            res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
            res.redirect('/');
            });
        });
  });

// Sign up route
app.get('/sign-up', function(req, res) {
    res.render('sign-up');
});

app.get('/logout', function(req, res) {
    res.clearCookie('nToken');
    res.redirect('/');    // Restructure .render() --> AJAX modal --> partial that renders via HTML
});

app.get('/login', function(req, res) {
    console.log("Got to login")
    res.render("login");  // Restructure .render() --> AJAX modal --> partial that renders via HTML
})

app.post('/sign-up', function(req, res, next) {
    // create User and 
    console.log("Hello there")
    const user = new User(req.body);

    // user.save((err) => {
    //   if (err) {
    //     return res.status(400).send({ err: err });
    //   }
    //   // generate a JWT for this user from the user's id and the secret key
    //   var token = jwt.sign({ id: user.id}, process.env.SECRET, { expiresIn: "60 days"});
    //   // set the jwt as a cookie so that it will be included in
    //   // future request from this user's client
    //   res.cookie('nToken', token, { maxAge: 900000, httpOnly: true});
    //   res.redirect('/');

      user
        .save()
        .then((user) => {
            var token = jwt.sign({ id: user.id}, process.env.SECRET, { expiresIn: "60 days"});
            // set the jwt as a cookie so that it will be included in
            // future request from this user's client
            res.cookie('nToken', token, { maxAge: 900000, httpOnly: true});
            res.redirect('/');
        })
        .catch((err) => {
            console.error(err.message);
            return res.status(400).send({ err: err });
        })
    })
}