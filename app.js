require('dotenv').config();

const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const encrypt = require("mongoose-encryption");

const md5 = require("md5");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const { use } = require('passport');
const { compareSync } = require('bcrypt');

const app = express();

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "This is our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// const secret = "ThisIsOurLittleSecretLongString";
// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
})

app.get("/login", function(req, res){
    res.render("login");
})

app.get("/register", function(req, res){
    res.render("register");
})

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
})

app.post("/register", function(req, res){
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     newUser.save()
    //     .then(()=>{
    //        res.render("secrets");
    //     })
    //     .catch(()=>{
    //        console.log("Error in rendering secrets of register..!!!")
    //     });
    // });

    User.register({username: req.body.username}, req.body.password)
    .then((user)=>{
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
        })
    })
    .catch((err)=>{
        console.log(err);
        res.redirect("/register")
    })

})

app.post("/login", function(req, res){
    // const username = req.body.username;
    // const password = req.body.password;
    // User.findOne(
    //     {email: username}
    // )
    // .then((foundUser)=>{
    //     bcrypt.compare(password, foundUser.password, function(err, result) {
    //         if(result === true){
    //             res.render("secrets");
    //         }
    //     });
        
    // })
    // .catch(()=>{
    //     console.log("Error in rendering secrets of login..!!!")
    // })

    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, function(err){
    if(err){
        console.log(err);
    }
    else{
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
        })
    }
    })
})

app.listen(3000, function(req, res){
    console.log("Server connected successfully");
})