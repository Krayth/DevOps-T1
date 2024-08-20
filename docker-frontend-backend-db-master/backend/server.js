const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");

const port = 3001;
const routes = require("./routes");

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


  app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
  });
}
