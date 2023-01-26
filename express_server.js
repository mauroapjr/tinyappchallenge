const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  user1: {
    id: "user1",
    email: "user1@user.com",
    password: "user1",
  },
  user2: {
    id: "user2",
    email: "user2@user.com",
    password: "user2",
  },
};

//Generate random short url
const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

//Loop through each email in users and check if it is the same as givin email
// function checkExistingEmail(email) {
//   for (let userID in users) {
//     if (users[userID].email === email) return true;
//   }
//   return false;
// }

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  const templateVars = { username: req.cookies.username };
  // let userId = req.session.user_id;
  // if (userId) {
  res.redirect("/urls");
  // } else {
  res.redirect("/login", templateVars);
  // }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies.username };
  //let userId = req.session.user_id;
  //console.log(req.session.user_id);
  console.log(req.session);
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  const password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);
  // let userVars = {
  //   id: userID,
  //   email: req.body.email,
  //   password: hashedPassword,
  // };
  // //if email or password is blank set and render 400 status
  // if (!userVars.email || !userVars.password) {
  //   res
  //     .status(400)
  //     .send("Please enter both an email and password to register.");
  //   //if email sent = email in db set and render 400 status
  // } else if (checkExistingEmail(req.body.email)) {
  //   res.status(400).send("A user with this email already exists.");
  // } else {
  //   // insert userVars into database
  //   users[userID] = userVars;
  //   req.session.user_id = userID;
  //   // res.cookie('user_id', userID);
    res.redirect("/urls");
  
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  console.log(req.cookies);
  req.cookies.username;

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
  const userName = req.body.username;
  console.log(userName);
  res.cookie("username", userName);
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body);
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    username: req.cookies.username,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  console.log(urlDatabase);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
