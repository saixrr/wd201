/* eslint-disable no-undef */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(bodyParser.json());
const path = require("path")
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser("shh!some secret string"));
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]));

app.set("view engine ","ejs");
app.use(express.static(path.join(__dirname,'public')));

app.get("/", async (request,response) =>{
  const overdue = await Todo.overdue();
  const dueToday  = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completed = await Todo.completed();

  
  if(request.accepts("html")){
    response.render("index.ejs",{
      title:"Todo application",
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
  });
  }else{
    response.json({
      overdue,
      dueToday,
      dueLater,
      completed
    })
  }
});



/*app.get("/", function (request, response) {
  console.log("Todo list ",request.body);
});*/

// app.get("/todos", async function (_request, response) {
//   console.log("Processing list of all Todos ...");
//   try{
//     const todo = await Todo.findAll();
//     return response.send(todo);
//   }
//   catch(error){
//     console.log(error);
//     return response.status(422).json(error);   
//   }
// });

/*app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});*/

app.post("/todos", async function (request, response) {
  console.log(request.body)
  try {
    const todo = await Todo.addTodo(request.body);
    return response.redirect("/")
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});


app.put("/todos/:id", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed,
    );
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});


app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try{
    await Todo.remove(request.params.id);
    response.json({success: true});
  }
  catch(error){
    console.log(error);
    return response.status(422).json(error);   
  }
});
// app.get("/todos", async(request,response) =>{
// const todoItems= await Todo.gettodo();
// response.json(todoItems);
// })
module.exports = app;
