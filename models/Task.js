const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    listId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'list'
    },
    description:{
        type:String,
        required:true,
        minLength:5
    },
    dueDate:{
        type:Date,
        min:Date.now
    },
    
    assignedDate:{
        type:Date,
        default:Date.now
    },
    isCompleted:{
        type:Boolean,
        default:false
    }
});

module.exports= mongoose.model('task',TaskSchema);