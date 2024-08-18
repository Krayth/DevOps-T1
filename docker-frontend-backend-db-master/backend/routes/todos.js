const express = require("express");
const router = express.Router();
const redis = require("redis");

const Todo = require("../models/todo");

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// GET all todos
router.get("/", async (req, res) => {
  const todos = await Todo.find({ is_complete: false });

  const counterKey = "todos_access_count"; // Chave para o contador

  // Incrementa o contador no Redis
  redisClient.incr(counterKey, (err, newCount) => {
    if (err) {
      console.error("Redis INCR error:", err);
      res.status(500).send("Server error");
      return;
    }
    
    // Aqui você pode retornar o contador ou outros dados
    res.json({ 
      data: todos,
      message: `This route has been accessed ${newCount} times` });
    });
});

// GET todo based on ID
router.get("/:id", async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id });
  res.send(todo);
});

// POST create new todo
router.post("/", async (req, res) => {
  console.log(req.body);
  const todo = new Todo({
    title: req.body.title,
    description: req.body.description,
    is_complete: req.body.is_complete || false,
    due_date: req.body.due_date || new Date(),
  });
  await todo.save();
  res.send(todo);
});

// UPDATE todo
router.patch("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id });

    if (req.body.title) {
      todo.title = req.body.title;
    }
    if (req.body.description) {
      todo.description = req.body.description;
    }
    if (req.body.is_complete) {
      todo.is_complete = req.body.is_complete;
    }
    if (req.body.due_date) {
      todo.due_date = req.body.due_date;
    }
    await todo.save();
    res.send(todo);
  } catch {
    res.status(404);
    res.send({ error: "Todo does not exist!" });
  }
});

// DELETE todo
router.delete("/:id", async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Todo does not exist!" });
  }
});

module.exports = router;
