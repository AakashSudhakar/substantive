// main.js (substances app)


// ==========================================================================
// ============================== DEPENDENCIES ==============================
// ==========================================================================

const express = require("express");                     // Install Express
const app = express();                                  // Initialize Express
const exphbs = require("express-handlebars");           // Install Handlebars
const methodOverride = require("method-override");      // Install Method-Override
const bodyParser = require("body-parser");              // Install Body-Parser
const cookieParser = require("cookie-parser");          // Install Cookie-Parser
const bcrypt = require("bcrypt");                       // Install BCrypt
const jwt = require("jsonwebtoken");                    // Install JSONWebToken
const mongoose = require("mongoose");                   // Install Mongoose

const Schema = mongoose.Schema;                         // Initialize MongoDB Schemas
const Comment = require("./models/model-comment");      // Call Comment model
const Location = require("./models/model-location");    // Call Location model
const Post = require("./models/model-post");            // Call Post model
const User = require("./models/model-user");            // Call User model

const substanceGroups = require("./substanceGroups.json");                      // Call substanceGroups JSON
const substanceClassifications = require("./substanceClassifications.json");    // Call substanceClassifications JSON

require("dotenv").config();                             // Install and configure dot-environment

// ==========================================================================
// ============================== INITIALIZERS ==============================
// ==========================================================================

// Initialize Body-Parser, Cookie-Parser, Express, and Method-Override
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(methodOverride("_method"))

// Initialize Handlebars
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");


// Check if user is logged in or not
let checkAuth = (req, res, next) => {
    console.log("Checking authentication");
    // Make sure the user has a JWT cookie
    if (typeof req.cookies.nToken === undefined || req.cookies.nToken === null) {
        req.user = null;
        console.log("No User");
    } else {
        // If the user has JWT cookie, decode it and initialize user
        let token = req.cookies.nToken;
        let decodedToken = jwt.decode(token, { complete: true }) || {};
        req.user = decodedToken.payload;
    }
    next();
}
app.use(checkAuth);

// Initialize Mongoose
mongoose.promise = global.promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/substantive");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

require("./auth.js")(app);                              // Call auth.js controller


// ==========================================================================
// ============================ RESOURCES: POSTS ============================
// ==========================================================================

// INDEX: Directs user to posts page (WORKING)
app.get("/posts", (req, res) => {
    console.log("yippee yiy yay");
    Post
        .find((err, posts) => {
            console.log(`${posts.length} posts were found`)
        }).then((posts) => {
            res.render("posts-index", { posts });
        }).catch((err) => {
            console.error(err.message);
        });
});

// NEW: New form request for a post (WORKING)
app.get("/posts/new", (req, res) => {
    res.render("posts-new", { });
});

// SHOW: Displays detailed information on post (WORKING)
app.get("/posts/:id", (req, res) => {
    Post
        .findById(req.params.id)
        .exec()
        .then((post) => {
            res.render("posts-show", { post });
        }).catch((err) => {
            console.error(err.message);
        });
});

// EDIT: Edits current post"s content (WORKING)
app.get("/posts/:id/edit", (req, res) => {
    Post
        .findById(req.params.id)
        .then((post) => {
            res.render("posts-edit", { post });
        }).catch((err) => {
            console.error(err.message);
        });
});

// CREATE: Generates new post with id from form completion (WORKING)
app.post("/posts", (req, res) => {

    // Create a location 
    // save location <-- *if* location should be it"s own object
    // Now create post and add the location 

    Post
        .create(req.body)
        .then((post) => {
            res.redirect(`/posts/${post._id}`);
        }).catch((err) => {
            console.error(err);
        });
});

// UPDATE: Updates post content information (WORKING)
app.put("/posts/:id", (req, res) => {
    Post
        .findByIdAndUpdate(req.params.id, req.body)
        .exec()
        .then((post) => {
            res.redirect(`/posts/${post._id}`);
        }).catch((err) => {
            console.error(err.message);
        });
});

// DELETE: Deletes status with id and data (WORKING)
app.delete("/posts/:id", (req, res) => {

    // Post.findOneAndRemove(req.params.id).then(() => {

    // }).catch(() => {

    // })

    Post
        .findByIdAndRemove(req.params.id)
        .then((post) => { 
            res.redirect("/posts");
        }).catch((err) => {
            console.error(err.message);
        });
});


// ==========================================================================
// ========================== RESOURCES: COMMENTS ===========================
// ==========================================================================


// ==========================================================================
// =========================== ROUTES: LOCATIONS ============================
// ==========================================================================

// INDEX: Directs user to home page (WORKING)
// app.get("/", (req, res) => {
//     Post
//         .find((err, posts) => {
//             console.log(`${posts.length} posts were found`)
//         }).then((posts) => {
//             res.render("posts-index", { posts });
//         }).catch((err) => {
//             console.error(err.message);
//         });
// });

// // INDEX: Directs user to landing page for world map (NOT WORKING)
// app.get("/world", (req, res) => {
//     Location
//         .find((err, locations) => {
//             console.log(`${locations.length} locations were found.`);
//         }).then((locations) => {
//             res.render("locations-index", { locations });
//         }).catch((err) => {
//             console.error(err.message);
//         });
// });

// ==========================================================================
// =========================== RESOURCES: USERS =============================
// ==========================================================================


// Profile route
app.get("/profile", (req, res) => {
    if (req.user) {
        User
            .findById(req.user.id)
            .exec()
            .then((user) => {
                let points = user.points;
                res.render("profile", { points, currentUser: req.user });
            }).catch((err) => {
                console.error(err.message);
            });
    } 
    else {
        res.redirect("/");
    }
});


// ==========================================================================
// =========================== ADDITIONAL LOGIC =============================
// ==========================================================================

// Shuffle function to rearrange buttons
let shuffle = (arr) => {
    let newArr = [...arr]
    for (let i = arr.length - 1; i > 0; i--) {
      // get a random index in the range
      let j = Math.floor(Math.random() * (i + 1));
      // swap the element at that index with the current element
      let temp = newArr[i];
      newArr[i] = newArr[j];
      newArr[j] = temp;
    }
    return newArr;
}

let shuffledSubstances = shuffle(substanceGroups);

// Correctness function that pops and returns status code off the shuffled list
let getCorrect = () => {
    if (shuffledSubstances.length == 0) {
      shuffledSubstances = shuffle(substanceGroups);
    }
    return shuffledSubstances.pop();
  }
  
  // Options function to return array of classifications
  let getOptions = (correctClassification) => {
    let answers = [];
    answers.push(correctClassification.classification);

    // Selects 6 types of substances
    while (answers.length < 6) {
        let index = Math.floor(Math.random() * substanceGroups.length);
        let nextOption = substanceGroups[index].classification;
        if (!answers.includes(nextOption)) {
            answers.push(nextOption);
        }
    }
    
    // Shuffle the multiple choice answer buttons
    return shuffle(answers);
}

// Route to initialize array of options with question
app.get("/", (req, res) => {
    let correct = getCorrect();    
    console.log("CORRECT STRUCTURE: ");
    console.log(correct);
    let answers = getOptions(correct);
  
    res.render("home", {correctSubstance: correct.name, correctClassifier: correct.classification, options: answers, currentUser: req.user});
});
  
// Route to check if answer is correct or not
app.post("/", (req, res) => {
    let answerText;
    let correctAnswer = req.body.correctAnswer;
    let userAnswer = req.body.userAnswer;
    console.log("REQ BODY: ");
    console.log(req.body);

    if (userAnswer + "/" == correctAnswer) {
        answerText = "Correct."

        if (req.user) {
            User
                .findById(req.user.id)
                .exec()
                .then((user) => {
                    user.points += 1;
                    user.markModified("points");
                    user.save();
                    console.log(user.points);
                });
        }
    } 
    else {
        let correctCategory = substanceGroups.filter((substanceObj) => {

            // check to see where correct.name exists in JSON, then print name and classification
            if (req.body == substanceObj.name + "/") {
                // console.log(`substance object classifier is ${substanceObj.classification}`);
                console.log("success");
                return substanceObj;
            }
        });

        correctClassifier = correctCategory;
        answerText = "Incorrect. " + req.body.correctName.replace("/", "") + " is classified in the group " + req.body.correctAnswer.replace("/", "") + ".";
    }

    // Get new question and display it to the user
    let correct = getCorrect();    
    console.log("CORRECT STRUCTURE: ");
    console.log(correct);
    let answers = getOptions(correct);
  
    res.render("home", {correctSubstance: correct.name, correctClassifier: correct.classification, isCorrect: answerText, options: answers, currentUser: req.user});
  });

// App listening to port 3030
let port = process.env.PORT || "3030"

app.listen(port, () => {
    console.log(`Substantive draft listening on port ${port}`)
});