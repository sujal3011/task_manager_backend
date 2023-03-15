const express=require("express");
const connecttoMongo=require("./db");
const cors = require('cors');
connecttoMongo();  //Connecting to mongo


const app=express();
app.use(cors())

app.use(express.json());

const PORT=process.env.PORT || 80

app.get('/',(req,res)=>{
    res.send("Hello,Welcome to task manager");
})

const auth=require('./routes/auth')
const lists=require("./routes/lists");
app.use('/auth',auth);
app.use('/lists',lists);


app.listen(PORT,()=>{
    console.log("The express app is running");
})
