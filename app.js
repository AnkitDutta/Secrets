//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session"); 
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

// console.log(process.env.API_KEY);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
    secret: "Babity Rabity.",
    resave: false,
    saveUninitialized: false
})); 

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.get("/",function(req, res){
    res.render("home");
});



app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.render("login");
    }
});

app.get("/register",function(req, res){
    res.render("register");
});
app.post("/register",function(req, res){ 
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(!err){
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
        else{
            console.log(err);
            res.redirect("register");
        }
    });  
});

app.get("/login",function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){//req.login is a passport function for logging in.
        if(!err){
            passport.authenticate("local")(req, res, function(){
                res.redirect("secrets");
            });
        }
        else{
            console.log(err);
            res.redirect("login");
        }
    });
});


app.delete("/logout", function(req, res){
    req.logout();//logout() is a passport function
    req.session.destroy(function(err){
        if(!err){
            res.redirect("/");
        }
        else{
            console.log(err);
        }
    });
    
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});