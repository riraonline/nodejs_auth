const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const User = require("./models/user.model");

mongoose
  .connect("mongodb://localhost:27017/auth_demo")
  .then((result) => {
    console.log("Server has connect to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "notasecret",
    resave: false,
    saveUninitialized: false,
  })
);

const auth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Your in Homepage");
});

app.get("/register", (req, res) => {
  res.render("register");
});

/*
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
  });
  await user.save();
  res.redirect("/");
});
*/

// alternatif
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

/*

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user_id = user._id;
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});
*/

// alternatif
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findByCredentials(username, password);
  if (user) {
    req.session.user_id = user._id;
    res.redirect("/admin");
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  // Jika hanya ingin menghapus user id nya saja //
  // req.session.user_id = null

  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/admin", auth, (req, res) => {
  /* if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("admin");
  } */
  res.render("admin");
});

app.get("/admin/profile", auth, (req, res) => {
  const user_id = req.session.user_id;
  res.send(`ID Profile: ${user_id}`);
});

app.listen(3000, () => {
  console.log("Server run at http://localhost:3000");
});
