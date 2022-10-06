const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
morgan(':method :url :status :res[content-length] - :response-time ms')
app.set("view engine", "ejs");
const bcrypt = require("bcryptjs");
var cookieParser = require('cookie-parser')

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
      return userFromDb;
    }
  }

  return null;
};
const generateUId = () => {
  return Math.random().toString(36).substring(2, 6);
};
const urlsForUser = (id) => {
  let userURL = {}
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userId === id) {
      userURL[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userURL;
}
app.get("/register", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  if (!userId) {
    return res.render("registration", templateVars)
  }
  res.redirect("urls")
})

app.get("/login", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlDatabase 
  };
  if (!userId) {
    return res.render("login", templateVars)  
  }
  res.redirect("/urls")
});

app.get("/urls/new", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlsForUser(userId) 
  };
  if (!userId) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  userId = req.cookies["userId"]
  let shortId = req.params.id
  const templateVars = {
    user: users[userId], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL 
  };
  if (!userId) {
    res.redirect("/login");
  }
  let userUrls = urlsForUser(userId)
  for (let url in userUrls) {
    if (url === shortId) {
      res.render("urls_show", templateVars);
    }
  }
  return res.send("That URL does not belong to you")
});

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id
  const longURL = urlDatabase[shortId].longURL;
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlsForUser(userId) 
  };
  if (!urlDatabase[shortId]) {
    return res.send("That ID is not in the short URL database")
  }
  res.redirect(longURL, templateVars);
});

app.get("/urls", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId], 
    urls: urlsForUser(userId) 
  };
  if (!userId) {
    res.send("Must log in before you can view your URLs");
  }
  res.render("urls_index", templateVars);
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('please include email AND password');
  }

  const userFromDb = getUserByEmail(email);
  if (userFromDb) {
    return res.status(400).send('email is already in use');
  }

  const id = generateUId();
  const user = {
    id,
    email,
    hashedPassword
  };

  users[id] = user;
  res.cookie('userId', user.id);
  res.redirect('/urls');
  console.log(users)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send('please include email AND password');
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send('No user with that email found');
  }
  if(!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Ah ah ah, you didn't type the magic word");
  }
  res.cookie('userId', user.id);
  res.redirect("/urls");
});


app.post("/urls/:id/update", (req, res) => {
  let id = req.params.id
  urlDatabase[id].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls") 
})


app.post("/logout", (req, res) => {
  res.clearCookie("userId")
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  userId = req.cookies["userId"];
  if (!userId) {
    return res.send("Cannot shorten URLs unless you are signed in")
  }
  let newId = generateRandomString(6);
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userId: userId
  }
  console.log(urlDatabase)
  res.redirect(`/urls/${newId}`); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});