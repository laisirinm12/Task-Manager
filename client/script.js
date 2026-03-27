const API = "https://task-manager-backend-4u9r.onrender.com/api/tasks";
let currentFilter = "all";

async function loadTasks() {

    const res = await fetch(API);
    let tasks = await res.json();

    const taskList = document.getElementById("taskList");
    const taskCount = document.getElementById("taskCount");

    taskList.innerHTML = "";
    taskCount.textContent = `${tasks.length} Tasks`;

    if(tasks.length === 0){
        taskList.innerHTML = "<p>No tasks yet. Add one!</p>";
        return;
    }

    // Sort active tasks first
    tasks.sort((a,b) => a.completed - b.completed);

    // Apply filters
    if(currentFilter === "active"){
        tasks = tasks.filter(t => !t.completed);
    }

    if(currentFilter === "completed"){
        tasks = tasks.filter(t => t.completed);
    }

    tasks.forEach(task => {

        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? "checked" : ""} 
                onclick="toggleTask(${task.id}, this.checked)">

                <div class="task-text">
                    <span id="task-${task.id}">${task.task}</span>
                    <small class="time">${task.createdAt || ""}</small>
                </div>
            </div>

            <div class="task-actions">
                <button onclick="editTask(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(li);

    });

}

async function addTask(){

  const input = document.getElementById("taskInput");
  const task = input.value.trim();

  if(task === ""){
    alert("Please enter a task");
    return;
  }

  await fetch(API,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({task})
  });

  input.value="";
  loadTasks();
}

async function toggleTask(id, completed){

  await fetch(`${API}/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({ completed })
  });

  loadTasks();
}

async function deleteTask(id) {

    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

async function editTask(id){

  const span = document.getElementById(`task-${id}`);
  const currentTask = span.innerText;

  const newTask = prompt("Edit your task:", currentTask);

  if(!newTask) return;

  await fetch(`${API}/${id}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({ task:newTask })
  });

  loadTasks();
}

function setFilter(filter){
    currentFilter = filter;
    loadTasks();
}

async function clearCompleted(){

  const res = await fetch(API);
  const tasks = await res.json();

  const completed = tasks.filter(t => t.completed);

  for(let task of completed){
    await fetch(`${API}/${task.id}`,{
      method:"DELETE"
    });
  }

  loadTasks();
}

loadTasks();

const input = document.getElementById("taskInput");

input.addEventListener("keypress", function(event) {
  if(event.key === "Enter"){
    addTask();
  }
});