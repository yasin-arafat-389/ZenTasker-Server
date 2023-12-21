const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5001;

// Parsers
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gef2z8f.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const tasksCollection = client.db("ZenTasker").collection("tasks");
  try {
    // API endpoint to insert task data to the database
    app.post("/add-task", async (req, res) => {
      let data = req.body;

      await tasksCollection.insertOne(data);

      res.send({ success: true });
    });

    // API endpoint to get specific tasks filtered by email
    app.post("/my-tasks", async (req, res) => {
      let email = req.query.email;

      let result = await tasksCollection.find({ email: email }).toArray();

      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.listen(port, () => {
  console.log(`ZenTasker listening on port ${port}`);
});
