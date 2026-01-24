var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  User = require("./models/user"),
  flash = require("connect-flash"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  mongoose = require("mongoose"),
  Campground = require("./models/campground"),
  Comment = require("./models/comment"),
  methodOverride = require("method-override");

// routes variables
var campgroundRoutes = require("./routes/campground"),
  commentRoutes = require("./routes/comment"),
  indexRoutes = require("./routes/index");

// var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_v11";
// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(flash());
// seedDB();

// PASSPORT CONFIG //
app.use(
  require("express-session")({
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// To pass details of logged in user to every route //
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
