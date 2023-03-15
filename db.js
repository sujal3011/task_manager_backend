// Connecting to moongose
const mongoose=require("mongoose");
require('dotenv').config()


const mongoURL=process.env.DATABASE

const connecttoMongo=()=>{
    mongoose.connect(mongoURL,()=>{
        console.log("Successfully connected to mongoDB");
    })
}

module.exports=connecttoMongo;




