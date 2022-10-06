const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
morgan(':method :url :status :res[content-length] - :response-time ms')
app.set("view engine", "ejs");
var cookieParser = require('cookie-parser')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  1: {
    id: 1,
    email: "tay@gmail.com",
    password: "1234"
  },
  2: {
    id: 2,
    email: "fake@fake.com",
    password: "pass"
  }
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan('dev'))

function generateRandomString(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for ( let i = 0; i < n; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;
};
const getUserByEmail = (email) => {
  for (const userId in users) {
    const userFromDb = users[userId];

    if (userFromDb.email === email) {
      // we found our user!!
      return userFromDb;
    }
  }

  return null;
};
const generateUId = () => {
  return Math.random().toString(36).substring(2, 6);
};


app.get("/urls/new", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    userId: req.cookies["userId"], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id
  const longURL = urlDatabase[shortId];
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  res.redirect(longURL, templateVars);
});

app.get("/urls", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  res.render("registration", templateVars)
})

app.get("/login", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  res.render("login", templateVars)
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if email or password are NOT defined
  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }

  // check if the email is already in use
  const userFromDb = getUserByEmail(email);

  // if email is duplicated, respond with error message
  if (userFromDb) {
    return res.status(400).send('email is already in use');
  }

  // create a new user object
  const id = generateUId();

  const user = {
    id,
    email,
    password
  };

  // update the users object with our new user
  users[id] = user;

  // do we log the user (set a cookie) OR do we redirect the user to /login
  res.cookie('userId', user.id);

  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  let id = req.params.id
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls") 
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send('No user with that email found');
  }
  if (user.password !== password) {
    return res.status(403).send("Ah ah ah, you didn't type the magic word");
  }
  res.cookie('userId', user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId")
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newId = generateRandomString(6);
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});