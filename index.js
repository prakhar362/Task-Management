const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware for parsing JSON request bodies
app.use(express.json());

// Path to your tasks.json file
const filePath = './todos.json';

// Utility function to read tasks from the JSON file
const getTasks = () => {
  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Utility function to save tasks to the JSON file
const saveTasks = (tasks) => {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
};

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to get all tasks
app.get('/tasks', (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// Route to add a new task
app.post('/tasks', (req, res) => {
  const tasks = getTasks();
  const newTask = req.body;
  newTask.id = tasks.length; // Assign a unique ID
  tasks.push(newTask);
  saveTasks(tasks);
  res.json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const tasks = getTasks(); // Fetch all tasks from JSON or database
  const taskId = parseInt(req.params.id, 10); // Ensure task ID is an integer
  const updatedTask = req.body; // Task data sent from frontend

  console.log('Incoming update request for task ID:', taskId, updatedTask); // Log the incoming request

  // Find task by id in the tasks array
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex !== -1) {
    // Merge existing task with the updated data
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
    console.log('Updated task:', tasks[taskIndex]); // Log the updated task

    saveTasks(tasks); // Save updated tasks back to JSON or database
    res.json(tasks[taskIndex]); // Respond with the updated task
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});


// Route to delete a task
app.delete('/tasks/:id', (req, res) => {
  const tasks = getTasks();
  const taskId = parseInt(req.params.id, 10);

  if (taskId >= 0 && taskId < tasks.length) {
    const removedTask = tasks.splice(taskId, 1);
    saveTasks(tasks);
    res.json(removedTask);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
