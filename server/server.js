const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

const tasksFile = path.join(__dirname, "tasks.json");

function readTasks() {
    const data = fs.readFileSync(tasksFile);
    return JSON.parse(data);
}

function writeTasks(tasks) {
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

app.get("/", (req, res) => {
    res.send("Task Manager API Running");
});

app.get("/api/tasks", (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
    const tasks = readTasks();

   const newTask = {
  id: Date.now(),
  task: req.body.task,
  completed: false,
  createdAt: new Date().toLocaleDateString()
};

    tasks.push(newTask);

    writeTasks(tasks);

    res.json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {

  const tasks = readTasks();
  const taskId = Number(req.params.id);

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // If editing text
  if (req.body.task) {
    task.task = req.body.task;
  }

  // If toggling completion
  if (req.body.completed !== undefined) {
    task.completed = req.body.completed;
  }

  writeTasks(tasks);

  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();

    const taskId = Number(req.params.id);

    const updatedTasks = tasks.filter(t => t.id !== taskId);

    writeTasks(updatedTasks);

    res.json({ message: "Task deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});