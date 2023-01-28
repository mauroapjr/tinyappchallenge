const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const { getUserByEmail, generateRandomString } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cookieSession({
  name: 'session',
  keys: ["Gosto de fusca"],
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const usersDatabase = {
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

app.get("/", (req, res) => {
  const templateVars = { username: req.session.user_id, user: usersDatabase[req.session["user_id"]] }; 
  res.redirect("/urls");
  res.redirect("/login", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: null, user: null }; 
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and password are required!");
  } 
  for (const values of Object.values(usersDatabase)) {
    if (
      values.email.toLocaleLowerCase() === req.body.email.toLocaleLowerCase()
    ) { 
      res.status(400).send("User already exists!");
    }
  }
  let hash = bcrypt.hashSync(req.body.password, 10);
  let id= generateRandomString();
  const newUser = {
    id: id,
    email: req.body.email,
    password: hash
  };
  usersDatabase[id] = newUser;
  req.session.id = id;
  return res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: usersDatabase[req.session["user_id"]]  };
  const userID = req.session["user_id"];
  const user = usersDatabase[userID];
  if (!user) {
    return res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, user: usersDatabase[req.session["user_id"]]}
    return res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  const userID = req.session["user_id"];
  const user = usersDatabase[userID];
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: longURL,
    userID: userID,
  };
  const templateVars = { user: usersDatabase[userID] }; 
    if (!user) {
    res.status(403).send('Please Log in first')
    } else {
    return res.redirect(`/urls/${id}`);  
  }  
});

app.post("/login", (req, res) => {
  const user_email = req.body.username; 
  const { email, password } = req.body;
  const potencialUser = getUserByEmail(user_email, usersDatabase); 
  if (!potencialUser) {
    return res.status(400).send("User not found");
  }
  if (!bcrypt.compareSync(req.body.password, potencialUser.password)) {
    return res.status(400).send("Password do not match");
  } 
  req.session.id = potencialUser.id;
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let userId = req.body.user_id; 
  if (userId) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: usersDatabase[req.session["user_id"]] };
    res.render("login", templateVars);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body); 
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: usersDatabase[req.session["user_id"]] }; 
  let loggedInUser = req.session["user_id"];
  if (!loggedInUser) {
    res.status(403).send('Please Log in first')
    res.redirect("/urls");
  } else {
    return res.render("urls_new", templateVars);  
  }  
});

app.get("/u/:id", (req, res) => {
  const templateVars = { user: usersDatabase[req.session["user_id"]] };
  const longURL = urlDatabase[req.params.id].longURL;
  const shortURL = req.params.id;
  let loggedInUser = req.session.user_id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Page not found');
  }
  if (!loggedInUser ) {
    return res.status(403).send('Not authorized to view, please log in')
  }
  if(urlDatabase[shortURL].userID !== loggedInUser) {
    return res.status(403).send('This is a Private Link')
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user_id: req.session.user_id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const templateVars = { user: usersDatabase[req.session["user_id"]] }; 
  const id = req.params.id;
  delete urlDatabase[id];
  let loggedInUser = req.session["user_id"];
  if (!loggedInUser) {
    return res.status(403).send('CAN NOT ACCESS. LOGIN FIRST.')
  } else {
    return res.render("urls_new", templateVars);  
  }  
});
   
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
