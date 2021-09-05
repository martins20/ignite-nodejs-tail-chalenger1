const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  if (!foundUser) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = foundUser;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists." });
  }

  const createdUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(createdUser);

  return respose.statu(201).json(createdUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const createdTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(createdTodo);

  return response.status(201).json(createdTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.json(foundTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  foundTodo.done = true;

  return response.json(foundTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  user.todos.splice(foundTodo, 1);

  return response.status(204).json();
});

module.exports = app;
