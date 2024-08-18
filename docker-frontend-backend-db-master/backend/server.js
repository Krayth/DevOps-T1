const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");

const port = 3001;
const routes = require("./routes");

// Conectar ao Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://mongo:27017/todos", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  const app = express();
  app.use(express.static("public"));
  app.use(express.json());
  app.use("/api", routes);

  // Rota para contar o número de acessos
  app.get("/api/todos", async (req, res) => {
    const counterKey = "todos_access_count"; // Chave para o contador

    // Incrementa o contador no Redis
    redisClient.incr(counterKey, (err, newCount) => {
      if (err) {
        console.error("Redis INCR error:", err);
        res.status(500).send("Server error");
        return;
      }

      console.log(`Todos route accessed ${newCount} times`);
      
      // Aqui você pode retornar o contador ou outros dados
      res.json({ message: `This route has been accessed ${newCount} times` });
    });
  });

  app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
  });
}
