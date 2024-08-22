const express = require("express");
const router = express.Router();
const redis = require("redis");
const Todo = require("../models/todo");

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

redisClient.on("error", (err) => {
  console.error("Redis error: ", err);
});

const cacheMiddleware = (req, res, next) => {
  const cacheKey = "todos";
  redisClient.get(cacheKey, (err, data) => {
    if (err) throw err;
    if (data) {
      return res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};

router.get("/", cacheMiddleware, async (req, res) => {
  const todos = await Todo.find({ is_complete: false });
  redisClient.setex("todos", 3600, JSON.stringify(todos));  // Cache é armazenado
  res.send(todos);
});

// Operações que invalidam o cache
const invalidateCache = () => {
  redisClient.del("todos", (err, response) => {
    if (err) {
      console.error("Error deleting cache: ", err);
    } else {
      console.log("Cache invalidated");
    }
  });
};

router.get("/:id", async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id });
  res.send(todo);
});

router.post("/", async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    description: req.body.description,
    is_complete: req.body.is_complete || false,
    due_date: req.body.due_date || new Date(),
  });
  await todo.save();
  invalidateCache();  // Invalida o cache após criar um novo todo
  res.send(todo);
});

router.patch("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id });
    if (req.body.title) todo.title = req.body.title;
    if (req.body.description) todo.description = req.body.description;
    if (req.body.is_complete) todo.is_complete = req.body.is_complete;
    if (req.body.due_date) todo.due_date = req.body.due_date;
    await todo.save();
    invalidateCache();  // Invalida o cache após atualizar um todo
    res.send(todo);
  } catch {
    res.status(404);
    res.send({ error: "Todo does not exist!" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id });
    invalidateCache();  // Invalida o cache após deletar um todo
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Todo does not exist!" });
  }
});

module.exports = router;
