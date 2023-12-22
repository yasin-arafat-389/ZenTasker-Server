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
    origin: [
      "http://localhost:5173",
      "https://zentask-a150d.web.app",
      "https://zentask-a150d.firebaseapp.com",
    ],
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
    app.get("/my-tasks/to-do/all", async (req, res) => {
      let email = req.query.email;
      let result = await tasksCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // API endpoint to get specific tasks filtered by email
    app.get("/my-tasks/to-do", async (req, res) => {
      let email = req.query.email;
      let result = await tasksCollection
        .find({ email: email, status: "to do" })
        .toArray();
      res.send(result);
    });

    // API endpoint to delete a task
    app.delete("/delete-task", async (req, res) => {
      const taskId = req.query.id;

      if (!ObjectId.isValid(taskId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid task ID" });
      }

      const objectId = new ObjectId(taskId);
      const result = await tasksCollection.deleteOne({ _id: objectId });

      if (result.deletedCount === 1) {
        res.json({ success: true, message: "Task deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Task not found" });
      }
    });

    // API endpoint to update a task data
    app.post("/update-task", async (req, res) => {
      let data = req.body;

      const taskId = req.body._id;
      const updatedData = req.body;

      const updatedTask = await tasksCollection.findOneAndUpdate(
        { _id: new ObjectId(taskId) },
        {
          $set: {
            title: updatedData.title,
            description: updatedData.description,
            deadline: updatedData.deadline,
            priority: updatedData.priority,
          },
        },
        { returnDocument: "after" }
      );

      res.send(updatedTask);
    });

    // API endpoint to update status to ongoing
    app.post("/update-status-to-ongoing", async (req, res) => {
      let status = req.body.status;
      let id = req.body.id;

      const updatedTask = await tasksCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: status,
          },
        },
        { returnDocument: "after" }
      );

      res.send(updatedTask);
    });

    // API endpoint to get all ongoing tasks
    app.get("/ongoing-task", async (req, res) => {
      let email = req.query.email;
      let result = await tasksCollection
        .find({ email: email, status: "ongoing" })
        .toArray();
      res.send(result);
    });

    // API endpoint to update status to completed
    app.post("/update-status-to-completed", async (req, res) => {
      let status = req.body.status;
      let id = req.body.id;

      const updatedTask = await tasksCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: status,
          },
        },
        { returnDocument: "after" }
      );

      res.send(updatedTask);
    });

    // API endpoint to get all completed tasks
    app.get("/completed-task", async (req, res) => {
      let email = req.query.email;
      let result = await tasksCollection
        .find({ email: email, status: "completed" })
        .toArray();
      res.send(result);
    });

    // API endpoint to update status to to do
    app.post("/update-status-to-todo", async (req, res) => {
      let status = req.body.status;
      let id = req.body.id;

      const updatedTask = await tasksCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: status,
          },
        },
        { returnDocument: "after" }
      );

      res.send(updatedTask);
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
