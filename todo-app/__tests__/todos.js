const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
const { application } = require("express");

let server, agent;
function extractCsrfToken(res){
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val()
}
describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf":csrfToken
    });
    expect(response.statusCode).toBe(302);
  });


  test("updating a todo", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf":csrfToken
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept","application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];
    const bool=latestTodo.completed?false:true;

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf:csrfToken,
      completed:bool,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text)
    expect(parsedUpdateResponse.completed).toBe(bool);
  });


  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
     });
     const groupedTodosResponse = await agent
      .get("/")
      .set("Accept","application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deletetodoresponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf:csrfToken,
    });

    expect(deletetodoresponse.statusCode).toBe(200);
  });
    //  const parsedResponse = JSON.parse(response.text);
    //  const todoID = parsedResponse.id;
   
    //  const deleteResponse = await agent.delete(`/todos/${todoID}`);
    //  expect(deleteResponse.statusCode).toBe(200);
    //  const parsedDeleteResponse = Boolean(deleteResponse.text);
    //  expect(parsedDeleteResponse).toBe(true);
    //  });
 });
