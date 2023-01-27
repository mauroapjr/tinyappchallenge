const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

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

// this user objects is my user database
const usersDatabase = {
  user1: {
    id: "user1",
    email: "user1@user.com",
    password: "user1",
  },
  //The key for this user is the user id
  user2: {
    id: "user2",
    email: "user2@user.com",
    password: "user2",
  },
};

const getUserByEmail = (emailToFind, usersDatabase) => {
  for (const userKey in usersDatabase) {
    console.log("userKey:", userKey);
    //object.key//this is I grab the value of an object
    //object[key]//this is I grab the value of an object
    const currentUser = usersDatabase[userKey]; // this gets the user values
    console.log("CURRENT USER:", currentUser);
    console.log("USER EMAIL TO FIND:", emailToFind);
    if (currentUser.email === emailToFind) {
      return currentUser;
    }
  }
  return undefined;
};

const getUserById = (id, urlDatabase) => {
    const userById = urlDatabase[id];
    if (userById) {
      return userById;
    }
    return null;
  };
  
  const urlsForUser = function(urlDatabase, id) {
    let userSpecificURLDatabase = {};
    console.log("the urlDatabase is: ", urlDatabase);
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        userSpecificURLDatabase[shortURL] = urlDatabase[shortURL];
      }
    }
    return userSpecificURLDatabase;
  };  

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

//const hash = bcrypt.hashSync(password, saltRounds);

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  const templateVars = { username: req.cookies.user_id, user: usersDatabase[req.cookies["user_id"]] }; //changed to user_id
  res.redirect("/urls");
  res.redirect("/login", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id, user: usersDatabase[req.cookies["user_id"]] }; //changed to user_id
  for (const value of Object.values(usersDatabase)) {
    if (
    value.email !== req.body.email) {
      return res.redirect("/urls");
    }
  //console.log(req.session);
  console.log(templateVars);
  res.render("urls_register", templateVars);
  }
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
  const newUser = {
    user_id: generateRandomString(),
    email: req.body.email,
    password: req.body.password,
  };
  usersDatabase[newUser.user_id] = newUser;
  res.cookie("user_id", newUser.user_id);
  console.log(usersDatabase);

  return res.redirect("/urls");
});

// old get
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: usersDatabase[req.cookies["user_id"]]  };//old
  console.log(req.cookies);//old
  const userID = req.cookies["user_id"];
  const user = usersDatabase[userID];

  //const checkUser = urlsForUser(user.id, usersDatabase);
  if(!user) {
    return res.redirect("/login");
  } else {

    const templateVars = { urls: urlDatabase, user: usersDatabase[req.cookies["user_id"]]}
   return res.render("urls_index", templateVars);//old
  }


  
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  const userID = req.cookies["user_id"];
  const user = usersDatabase[userID];
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: longURL,
    userID: userID,
  };
  
  const templateVars = { user: usersDatabase[userID] }; 
  //let loggedInUser = req.cookies["user_id"];
  if (!user) {
    res.status(403).send('Please Log in first')
    //res.redirect("/urls");
  } else {
    return res.redirect(`/urls/${id}`);  
  }  
  console.log(urlDatabase);
});

app.post("/login", (req, res) => {
  const user_email = req.body.username; //leave this as a username
  const { email, password } = req.body;
  //const {error, users} = authenticateUser(database, email, password);
  const potencialUser = getUserByEmail(user_email, usersDatabase); // this line grabs user from database
  //const potencialUser = usersDatabase[email];//this line does NOT grab the user from the database
  //usersDatabase.users[id]
  console.log("REQ>BODY:", req.body);
  if (!potencialUser) {
    return res.status(400).send("User not found");
  }

  if (potencialUser.password !== password) {
    return res.status(400).send("Password do not match");
  }

  res.cookie("user_id", potencialUser.id);
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let userId = req.body.user_id; //changed session to body and to user_id
  if (userId) {
    res.redirect("/urls");
  } else {
    const templateVars = {  user: usersDatabase[req.cookies["user_id"]] };
    res.render("login", templateVars);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body); //changed session to body and to user_id
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: usersDatabase[req.cookies["user_id"]] }; 
  let loggedInUser = req.cookies["user_id"];
  if (!loggedInUser) {
    
    res.status(403).send('Please Log in first')
    res.redirect("/urls");
  } else {
  
  
  return res.render("urls_new", templateVars);  
  }  
});

app.get("/u/:id", (req, res) => {
  const templateVars = { user: usersDatabase[req.cookies["user_id"]] };
  const longURL = urlDatabase[req.params.id].longURL;
  const shortURL = req.params.id;
  
  let loggedInUser = req.cookies.user_id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('Page not found');
  }
  
  if (!loggedInUser ) {
    return res.status(403).send('Not authorized to view, please log in')
  }
  console.log(loggedInUser);
  console.log(urlDatabase[shortURL]);
  if(urlDatabase[shortURL].userID !== loggedInUser) {
    return res.status(403).send('This is a Private Link')
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
   const templateVars = {
    id: req.params.id,
    user_id: req.cookies.user_id, // changed to id
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[req.cookies["user_id"]],
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
  urlDatabase[id].longURL = longURL;
  console.log(urlDatabase);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
