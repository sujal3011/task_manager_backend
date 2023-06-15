const express=require("express");

const passport=require('passport');
const session = require('express-session');
require("./config/passport-setup");

require('dotenv').config()
const connecttoMongo=require("./db");
const cors = require('cors');
connecttoMongo();  //Connecting to mongo

const methodOverride = require('method-override');
const bodyParser = require("body-parser");

const app=express();
app.use(cors());

//using passport and express-session
app.use(session({ secret: process.env.SESSION_SECRET })); // session secret
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(methodOverride("_method"));


app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, auth-token, Referer, User-Agent, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Preflight', true)

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    
    next();
})

app.use(express.json());

const PORT=process.env.PORT || 80

app.get('/',(req,res)=>{
    res.send("Hello,Welcome to task manager");
})

const auth=require('./routes/auth')
const lists=require("./routes/lists");
const tasks=require("./routes/tasks");
app.use('/auth',auth);
app.use('/lists',lists);
app.use('/tasks',tasks);


app.listen(PORT,()=>{
    console.log(`The express app is running on port ${PORT}`);
})
