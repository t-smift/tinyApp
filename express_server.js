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

app.get("/register", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  if (!userId) {
    return res.render("registration", templateVars);
  }
  res.redirect("urls");
});

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
    urls: helper.urlsForUser(userId, urlDatabase)
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
  const shortId = req.params.id;
  let userUrls = helper.urlsForUser(userId, urlDatabase);
  if (!userUrls[shortId]) {
    return res.send("That URL does not belong to you");
  }
  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURL: userUrls[shortId].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId]["longURL"];
  if (!urlDatabase[shortId]) {
    return res.send("That ID is not in the short URL database");
  }
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  userId = req.session["userId"];
  const templateVars = {
    user: users[userId],
    urls: helper.urlsForUser(userId, urlDatabase)
  };
  if (!userId) {
    res.send("Must log in before you can view your URLs");
  }
  res.render("urls_index", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }

  const userFromDb = helper.getUserByEmail(email);
  if (userFromDb) {
    return res.status(400).send('email is already in use');
  }

  const id = helper.generateUId();
  const user = {
    id,
    email,
    hashedPassword
  };

  users[id] = user;
  req.session.userId = user.id;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send('please include email AND password');
  }
  const user = helper.getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('No user with that email found');
  }
  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Ah ah ah, you didn't type the magic word");
  }
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
  req.session = null;
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
  res.redirect(`/urls/${newId}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});