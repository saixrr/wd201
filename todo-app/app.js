const express = require('express')
const app = express()
const { Todo } = require("./models")
const bodyParser = require('body-parser')
app.use(bodyParser.json());


app.get("/", function (request, response) {
    response.send("Hello World");
  });
  
app.get("/todos", async function (request, response) {
    console.log("Processing list of all Todos ...");
    try {
        const todoslist = await Todo.findAll();
        return response.json(todoslist);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});
  
app.get("/todos/:id", async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  });

app.post("/todos", async (request, response) => {
    console.log("Creating a todo", request.body)
    try {
        const todo = await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            completed: false
        })
        return response.json(todo)

    } catch (error) {
        console.log(error)
        return response.status(422).json(error)
    }

})

app.put("/todos/:id/markAsCompleted", async (request, response) => {
    console.log("we have to update a todo with ID:", request.params.id)
    const todo = await Todo.findByPk(request.params.id)
    try {
        const updatedTodo = await todo.markAsCompleted()
        return response.json(updatedTodo)
    } catch (error) {
        console.log(error)
        return response.status(422).json(error)

    }
})

app.delete("/todos/:id", async (request, response) => {
    console.log("Delete a todo by ID: ", request.params.id)
    try {
        const result = await Todo.destroy({
          where: {
            id: request.params.id,
          },
        });
        if (result) return response.send(true);
        return response.send(false);
      } catch (error) {
        console.error(error);
      }
})

module.exports = app;
