//Uses mongoose to connect to a MongoDB database server
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Expense", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//define the schema: the types of data stored in the database
const expenseSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    type: { type: String, required: true },         // Expense or Income
    category: { type: String, required: true },        // Food, Rent, Salary, etc.
    amount: { type: Number, required: true },
    description: { type: String, required: false }    
});

//create a model around the schema,
//Allows us to interact with the database with CRUD operations
const Expense = mongoose.model("Expense", expenseSchema);

//import the express module and create an Express application
// middleware so when user submits HTML form, data is parsed and available in req.body for route handler
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));



/*
THIS IS IMPORTANT: Basic Routing to root URL!!!
When user accesses root URL, server responds with "Hello World!" message
*/
/* 
app.get('/', (req, res) => {
res.send("Hello World!");
});
*/

//re.sendFile() method to send "HTML" file as response to client
// We can connect the index.html file to the server
app.get('/', (req,res) =>{
  res.sendFile(__dirname + '/index.html');
})


// Use Express to post data to the database
// "add-expense" route to handle form submissions
app.post('/add-expense', async (req, res) => {
    // 1) New "Mongoose Model Instance" --> create a new document of "Expense" schema to be saved in the database
    // 2) "express.urlencoded middleware" req.body is object containing submitted form data. 
    //     The code pulls from req.body field and assign to newExpense model instance
    try{
      const newExpense = new Expense({
        date: req.body.date,
        type: req.body.type,
        category: req.body.category,
        amount: req.body.amount,
        description: req.body.description
      });
      // Save the new expense instance to the database, unless error occurs
      await newExpense.save();
      res.redirect('/thank-you');
    }
    catch(err){
      return res.status(500).send('Error saving data');
    }
});
//Resolve and issues by using try-catch block to handle errors during database operations
//ALso used async-await syntax to handle asynchronous operations



// Simple thank-you page after form submission
app.get('/thank-you', (req, res) => {
  res.send('Thank you for submitting your expense!');
});

//ensure that the server has accepted the HTML form request and processed it successfully
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});