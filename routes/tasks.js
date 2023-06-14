const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const List = require("../models/List");
const { body, validationResult } = require('express-validator');
const Task = require("../models/Task");

//ROUTES FOR TASKS

router.get('/:id/gettasks',fetchUser, async (req, res) => {
    try {
        const {status,order,query}=req.query;
        const regexPattern= new RegExp(query,'i');
        const currentDate = new Date();
        //Filtering the tasks based on their status
        let tasks;
        if(status==="all"){
            tasks = await Task.find({ description: { $regex: regexPattern }, user:req.user.id,listId: req.params.id });
        }
        else if(status==="completed"){
            tasks = await Task.find({ description: { $regex: regexPattern },user:req.user.id,listId: req.params.id,isCompleted:true });
        }
        else if(status==="active"){
            tasks = await Task.find({ description: { $regex: regexPattern },user:req.user.id,listId: req.params.id,isCompleted:false,dueDate: { $gte: currentDate } });
        }
        else if(status==="pending"){
            tasks = await Task.find({ description: { $regex: regexPattern },user:req.user.id,listId: req.params.id,isCompleted:false,dueDate: { $lt: currentDate } });
        }
        //Sorting the tasks

        if (order === "dueDate_ascending") {
            tasks.sort((a, b) => a.dueDate - b.dueDate);
          } else if (order === "dueDate_descending") {
            tasks.sort((a, b) => b.dueDate - a.dueDate);
          } else if (order === "assignedDate_ascending") {
            tasks.sort((a, b) => a.assignedDate - b.assignedDate);
          } else if (order === "assignedDate_descending") {
            tasks.sort((a, b) => b.assignedDate - a.assignedDate);
        }

        res.json(tasks);

    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

router.post('/:id/addtask',fetchUser, [
    body('description', 'Enter a valid description of the task').isLength({ min: 5 }),
    body('dueDate', 'Enter a valid due date of the task').isDate()
], async (req, res) => {
    try {
        const { description, dueDate } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const task = new Task({
            user:req.user.id,description, dueDate, listId: req.params.id
        })
        const savedTask = await task.save();
        res.json(savedTask);

    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

router.put('/updatetask/:taskId',fetchUser,async(req,res)=>{   //put request is usually used for updating

    const {description,dueDate}=req.body;
    try {
        const newTask={};

        if(description){newTask.description=description};
        if(dueDate){newTask.dueDate=dueDate};
    
        let task=await Task.findById(req.params.taskId);
        if(!task){
            return res.status(404).send("Not found") 
        }
        if(req.user.id!==task.user.toString()){
            return res.status(401).send("Not allowed");
        }
        task=await Task.findByIdAndUpdate(req.params.taskId,{$set:newTask},{new:true});
        res.json(task);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

router.delete('/deletetask/:taskId',fetchUser,async(req,res)=>{ 

    try {
        let task=await Task.findById(req.params.taskId);   
        if(!task){
            return res.status(404).send("Not found") 
        }
        if(req.user.id!==task.user.toString()){
            return res.status(401).send("Not allowed");
        }
        task=await Task.findByIdAndDelete(req.params.taskId);
        res.json({"Success":"Task successfully deleted",task:task});
    } catch (error) {
        res.status(500).send("Internal server error");
    }

})

router.patch('/updatetaskstatus/:taskId',fetchUser,async(req,res)=>{ 

    try {
        
        //Finding the task
        let task=await Task.findById(req.params.taskId);
        if(!task){
            return res.status(404).send("Not found") 
        }
        if(req.user.id!==task.user.toString()){
            return res.status(401).send("Not allowed");
        }
        task=await Task.findByIdAndUpdate(req.params.taskId,req.body,{
            new:true
        });
        res.json(task);
    } catch (error) {
        res.status(500).send("Internal server error");
    }

})

module.exports = router