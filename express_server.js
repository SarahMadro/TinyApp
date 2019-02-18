const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080;
const app = express();
app.use(cookieParser())


app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));


app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
};

//registration error handler
function isEmailTaken(email) {
  for (let key in users) {
    let user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

// checks/ compares password and email
function passwordMatch(password, email) {
  for (let key in users) {
    if (users[key].email === email && users[key].password === passowrd) {
      return users[key];
    }
  }
  return false;
};

// filters through database comparing userid w logged in id
function urlsId(id) {
  let obj = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      obj[key] = urlDatabase[key];
    }
  }

  return obj;
};

//check/compare for the hashpassword function
function matchPassword(password, email) {
  for (let key in users) {
    console.log('password', password);
    if (users[key].email === email) {
      if (bcrypt.compareSync(password, users[key].password)) {
        return users[key];
      }
    }
  }
  return false;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("hi", 10)

  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// if not a user or logged in they cant create new urls
app.get("/urls/new", (req, res) => {
  let user = users[req.session["user_id"]]
  let userID = req.session["user_id"]; ///removed user[];

  let templateVars = {
    user: users[req.session["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlsId(userID)
  };
  if (!user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars); //changed from index to new
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = users[req.session["user_id"]]
  if (userID) {
    let templateVars = {
      userID: req.session.userID,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: userID
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("<p>Not Authorized</p><a href='/login'>Login</a>");
  }
});

//filter through
app.get('/urls', (req, res) => {
  let user = users[req.session["user_id"]];
  let userID = req.session["user_id"];
  if (user) {
    let templateVars = {
      urls: urlsId(userID),
      user: users[userID],
    }
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  };
});

app.post("/urls", (req, res) => {
  let randomStr = generateRandomString(7);
  let user = users[req.session["user_id"]]
  if (!user) {
    res.status(400).send("<p>Not Authorized</p><a href='/login'>Login</a>");
    res.redirect('/login');
  } else {
    let urlObj = {
      shortURL: randomStr,
      longURL: req.body.longURL,
      userID: req.session["user_id"]
    };

    urlDatabase[randomStr] = urlObj;
    res.redirect(`/urls`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let user = req.session.user_id
  if (!user) {
    res.status(400).send("<p>Not Authorized</p><a href='/login'>Login</a>");
  } else {
    if (user === urlDatabase[req.params.shortURL].userID) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    }
  }
});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let urlObj = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  urlDatabase[shortURL] = urlObj;
  res.redirect("/urls/");
});

app.post('/login', (req, res) => {
  let user = isEmailTaken(req.body.email);
  let userFound = matchPassword(req.body.password, req.body.email);

  if (userFound) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    if (req.body.password !== user.password) {
      res.status(400).send("<p>Incorrect Password</p><a href = '/login'>Go Back</a>");
    } else {
      res.status(400).send("<p>Not a Registered Username</p><a href='/login'>Go Back</a>");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get('/register', (req, res) => {
  let templateVars = {
    user: ''
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  let newId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (req.body.email === '' && req.body.password === '') {
    res.status(400).send("<p>'Please fill out the feilds.'</p><a href='/register'>Go Back</a>");
    res.redirect('/register');
  } else if (isEmailTaken(req.body.email)) {
    res.status(400).send("<p>'Sorry, this username is taken, please try again with another.'</p><a href='/login'>Go Back</a>");
    res.redirect('/register');
  } else {
    let hashedPassword = bcrypt.hashSync(password, 10);
    users[newId] = {
      id: newId,
      email: email,
      password: hashedPassword
    }
    req.session.user_id = newId;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.userID],
    userID: req.session.userID
  };
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});