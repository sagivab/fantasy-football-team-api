const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

const userRoute = require('./routes/user.route');
const playerRoute = require('./routes/player.route');
const teamRoute = require('./routes/team.route');
const apiErrorHandler = require('./error/api-error-handler');

require('dotenv').config();

const app = express();
const database_url = process.env.DATABASE_URL || 'mongodb://localhost:27017/fantasy-football-teams'


mongoose.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if(err) {
        return console.error('Error connecting to :', process.env.DATABASE_URL, err);
    }    
    console.log('Connected successfully to:', database_url);
});


app.use(bodyParser.json())



const sessionOptions = {
    secret: process.env.SECRET_KEY,
    resave: false,
    cookie: {
        maxAge: 3600*1000,
    },
    saveUninitialized: false,
};

if(!process.env.TESTING) {
    const store = new MongoDBSession({
        uri: database_url,
        collection: 'sessions',
    });
    sessionOptions.store = store

}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session(sessionOptions));


app.use('/user', userRoute);
app.use('/player', playerRoute);
app.use('/team', teamRoute);
app.use(apiErrorHandler);

module.exports = app;