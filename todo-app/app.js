/* eslint-disable no-undef */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path")

app.set("view engine ","ejs");

app.get("/", async (request,response) =>{
  const allTodos = await Todo.getTodos(); 
  if ( request.accepts("html")){
    response.render('index.ejs',{
      allTodos
    });
  }else {
    response.json({
      allTodos
    })
  }
});



app.use(express.static(path.join(__dirname,'public')));

/*app.get("/", function (request, response) {
  console.log("Todo list ",request.body);
});*/

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try{
    const todo = await Todo.findAll();
    return response.send(todo);
  }
  catch(error){
    console.log(error);
    return response.status(422).json(error);   
  }
});

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
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try{
    const a=await Todo.destroy({    
      where: {
        id: request.params.id
      }
    });
    response.send(a>0);
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
