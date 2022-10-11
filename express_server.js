const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
morgan(':method :url :status :res[content-length] - :response-time ms');
app.set("view engine", "ejs");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const helper = require('./helpers');

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["monster"],
}));
app.use(morgan('dev'));

//example URLs for the database, registered to example user id "a"
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "a",
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userId: "a",
  },
};

//example users, just used for testing, can delete
//shows that each generated user needs an ID, and email and a password
const users = {
  a: {
    id: "a",
    email: "tay@gmail.com",
    password: "1234"
  },
  b: {
    id: "b",
    email: "fake@fake.com",
    password: "pass"
  }
};

//the get register request will render the registration page if a user is not logged in, or redirect to the urls page if they are. 
app.get("/register", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  if (!userId) { //checks for the userId cookie
    return res.render("registration", templateVars);
  }
  res.redirect("urls");
});

//once a user logs in the server will redirect them the the urls page, or render the login page if they try to access this without being logged in
app.get("/login", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  if (!userId) {
    return res.render("login", templateVars);
  }
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: helper.urlsForUser(userId, urlDatabase) //this function call only sends the urls attached to the signed in user as template vars
  };

  if (!userId) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  userId = req.session["userId"];
  if (!userId) {        
    res.redirect("/login");
  }
//checks if user is logged in or redirects to login page

  const shortId = req.params.id;
  let userUrls = helper.urlsForUser(userId, urlDatabase);
  if (!userUrls[shortId]) {
    return res.send("That URL does not belong to you");
  }
// if they are loggin in, this checks if the shortUrl enterred in the browser is in this users database

  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURL: userUrls[shortId].longURL
  };
  res.render("urls_show", templateVars);
});
// if they are logged in and the shortUrl belongs to them, we render the page for that URL. 


app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId]["longURL"];
  if (!urlDatabase[shortId]) {
    return res.send("That ID is not in the short URL database");
  }
  //this get request refers to the link that users receive to give out, so it does not check for sign-in or database. 
  // it only checks if the ID exists at all, and if it does, redirects to the actual website
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: helper.urlsForUser(userId, urlDatabase)
  };

  //users who try to access the URLs page without loggin in will be redirected to login page
  if (!userId) {
    res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: helper.urlsForUser(userId, urlDatabase)
  };
  if (!userId) {
    res.redirect("/login");
  }
  //home page that displays welcome message to new users, or redirects to login for non signed in users
  res.render("home", templateVars);
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
//registration endpoint, hashes the submitted password and stores email

  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }
//checks if both have been filled in before submission
  const userFromDb = helper.getUserByEmail(email);
  if (userFromDb) {
    return res.status(400).send('email is already in use');
  }
//checks the submitted email against the database
  const id = helper.generateUId();
  const user = {
    id,
    email,
    hashedPassword
  };
//if the submission passes, this function generates an unique ID and creates a new user Object to be stored
  users[id] = user;
  req.session.userId = user.id;
  res.redirect('/urls');
});
//finally the registered user is directed to the URLs page

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send('please include email AND password');
  }
//checsks if both an email and password were enterred

  const user = helper.getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('No user with that email found');
  }
  //checks submitted email against our database

  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Ah ah ah, you didn't type the magic word");
  }
  //compares hashed passwords

  req.session.userId = user.id;
  res.redirect("/urls");
});


app.post("/urls/:id/update", (req, res) => {
  let id = req.params.id;
  userId = req.session["userId"];
  if (!userId) {
    return res.redirect("/login");
  }
  let userUrls = helper.urlsForUser(userId, urlDatabase);
  if (!userUrls[id]) {
    return res.send("No such short URL exists");
  }

  urlDatabase[id].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!userId) {
    return res.send("You do not have permission to delete this URL");
  }
  let userUrls = helper.urlsForUser(userId, urlDatabase);
  if (!userUrls[id]) {
    return res.send("You cannot delete that which does not yet exist");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null; //clears the secret cookies
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  userId = req.session["userId"];
  if (!userId) {
    return res.send("Cannot shorten URLs unless you are signed in");
  }
  let newId = helper.generateRandomString(6);
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userId: userId
  };
///this redirect route inserts the newly generated shortID, and sends the user to that page
  res.redirect(`/urls/${newId}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});