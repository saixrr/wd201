/* eslint-disable no-undef */
const todoList = require("../todo");

const { all, overdue, dueToday, dueLater, markAsComplete, add } = todoList();

describe("Todolist Test Suite", () => {
  beforeAll(() => {
    const today = new Date();
    add({
      title: "visit temple",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
    add({
      title: "complete course",
      completed: false,
      dueDate: new Date(
        today.getTime() - 60 * 60 * 24 * 1000
      ).toLocaleDateString("en-CA"),
    });
    add({
      title: "watching AOT",
      completed: false,
      dueDate: new Date(
        today.getTime() + 60 * 60 * 24 * 1000
      ).toLocaleDateString("en-CA"),
    });
  });
  test("Should add new todo", () => {
    const todoItemsCount = all.length;
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });
  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
  test("retrieval of overdue items", () => {
    expect(overdue().length).toBe(1);
  });
  test("retrieval of dueToday items", () => {
    expect(dueToday().length).toBe(2);
  });
  test("retrieval of dueLater items", () => {
    expect(dueLater().length).toBe(1);
  });
});
