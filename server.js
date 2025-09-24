/*
Fortnite: Users still need to be able to navigate easily through diffent CRUD operations and not have to use the click back or forwards
buttons in bewteen the website URL. 
*/
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
  //Fortnite: Create a redirection to the root URL after a 5 seconds
  //setTimeout(()=>{res.redirect('/')}, 5000); 
});
// Personal notes: Do not use mutliple res methods in a CRUD operation


//The user will be able to view all expense or the entire data set within the MongoDB. 
//They only need to click a button to confirm this action.
app.get('/view-all-expense', async (req,res) => {
  try{
    const data = (await Expense.find({}).sort({date: 1}));//Diasplay all transaction by date in ascending order
    res.send(data);
  }
  catch(err){
    return res.status(500).send('Error retrieving all expenses');
  }
})



//The user will be able to view the data based on input the transaction date or category to search within the database.
//This is possible through "Dynamic Filtering", we used condition to only filter the search if the user HAS provide the valid inputs. 
app.get('/view-expense', async (req, res) => {
  try{
    newFilter = {};
    if (req.query.expenseDate){
       newFilter.date = req.query.expenseDate;
    }
    if (req.query.expenseValue){
      newFilter[req.query.expenseOption] = req.query.expenseValue;
    }
    const data = await Expense.find(newFilter);
    if(data == null ||data.length === 0){
      return res.status(404).send('No expense found for the given date or category.');
    }
    else{
      res.send(data);
    }
  }
  catch(err){
    return res.status(500).send('Error retrieving expense by date or category.')
  }
})
// Personal Notes: use "req.query" when accessing data with GET request. Use "req.body" when accessing data to send with POST request

/*
Personal Note: Find will always follow a structure once you include the initial paramter (left of colon), it will ALWAYS attempt to 
find the value of the right of the colon. Instead we use if statement to include values of left colon when available. Otherwise, by
not including it in the find() method, it will not be used as a filter
*/


app.post('/delete-expense', async (req,res) => {
  try{
    if (!req.body.checkDelete){
      console.log('Delete confirmation checkbox not checked.');
      res.redirect('/');
    }
    else{
      const newfilter={};
      if(req.body.deleteDate){
        newfilter.date = req.body.deleteDate;
      }
      if(req.body.deleteValue){
        newfilter[req.body.deleteOption] = req.body.deleteValue;
      }
      const result = await Expense.deleteOne(newfilter);
      if(result.deletedCount === 0){
        return res.status(404).send('No matching expense found to delete.');
      }
      res.redirect('/thank-you');
    }
  }
  catch(err){
    return res.status(500).send('System Error: Action deleting a transaction.')
  }
})


//ensure that the server has accepted the HTML form request and processed it successfully
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});