const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv').config();

const mongoDb = process.env.DB_URL;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error'));

const User = mongoose.model(
  'User',
  new Schema({
    fullName: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true }
    },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: Boolean, required: true }
  })
);

const app = express();
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username." })
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" })
      };
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});





app.listen(3000, () => console.log("app listening on port 3000!"));
