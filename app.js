const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

const userRoute = require('./routes/user');
const interviewRoute = require('./routes/interview');
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/ty_project')
  .then(() => console.log("MongoDB Connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get('/', async (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

app.use("/api/interview", interviewRoute);
app.use("/user", userRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
