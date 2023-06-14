const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const List = require("../models/List");
const { body, validationResult } = require('express-validator');
const Task = require("../models/Task");

// ROUTES FOR LISTS

// ROUTE-1---->getting all the lists of the user

router.get('/getlists', fetchUser, async (req, res) => {
    try {
        const {query}=req.query;
        const regexPattern= new RegExp(query,'i');
        const lists = await List.find({ user: req.user.id,title: { $regex: regexPattern } });
        res.json(lists);
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

// ROUTE-2---->adding a list 

router.post('/addlist', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 2 }),
], async (req, res) => {
    try {
        const { title } = req.body;  //destructuring 
        const errors = validationResult(req);    //validating using express validator
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const list = new List({
            title, user: req.user.id   //Creating a new object of Lis model 
        })
        const savedList = await list.save();
        res.json(savedList);


    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

//ROUTE-3----->updating a list

router.put('/updatelist/:id', fetchUser, async (req, res) => {   //put request is usually used for updating

    const { title } = req.body;  //destructuring

    try {
        const newList = {};
        if (title) { newList.title = title };
        let list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).send("Not found");
        }
        if (req.user.id !== list.user.toString()) {  
            return res.status(401).send("Not allowed");
        }
        list = await List.findByIdAndUpdate(req.params.id, { $set: newList }, { new: true });
        res.json(list);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})


//ROUTE-4----->deleting a list

router.delete('/deletelist/:id', fetchUser, async (req, res) => {

    try {

        //first deleting all the tasks of the list 

        //finding the tasks
        const tasks = await Task.find({ listId: req.params.id });

        //deleting the tasks
        for(let i=0;i<tasks.length;i++){
            let task=await Task.findByIdAndDelete(tasks[i]._id);
            res.json("The task deleted of the list",task);
        }
        //Finding the list to be updated
        let list = await List.findById(req.params.id);  

        if (!list) { 
            return res.status(404).send("Not found")
        }
        if (req.user.id !== list.user.toString()) {  
            return res.status(401).send("Not allowed");
        }
        list = await List.findByIdAndDelete(req.params.id);
        res.json({ "Success": "List successfully deleted", list: list });
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})


module.exports = router