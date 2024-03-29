class Task {
    constructor(id, name, date, time, taskLength, isConstant, isDaily, isWeekly) {
      this.id = id;
      this.name = name;
      this.date = date;
      this.time = time;
      this.taskLength = taskLength;
      this.isConstant = isConstant;
      this.isWeekly = isWeekly;
      this.isDaily = isDaily;
    }
    
    getName() {
      return this.name;
    }
  
    getDate() {
      return this.date;
    }
  
    getTime() {
      return this.time;
    }
  
    getTaskLength() {
      return this.taskLength;
    }

    getIsConstant() {
      return this.isConstant;
    }

    getIsDaily() {
      return this.isDaily;
    }

    getIsWeekly() {
      return this.isWeekly;
    }

    getId() {
      return this.id;
    }
  
    toString() {
      return `${this.name} - Due: ${this.date} ${this.time} - Length: ${this.taskLength} hours + - id ${this.id} - + - isConstant ${this.isConstant} - + - isDaily ${this.isDaily} - + - isWeekly ${this.isWeekly} -`;
    }
  
    urgencyRating() {
        // Convert the task date and time to a Date object
        const taskDateTime = new Date(`${this.date}T${this.time}`);
      
        // Calculate the number of hours or minutes between the current time and the task time
        let hoursUntilTask = Math.round((taskDateTime - Date.now()) / (1000 * 60 * 60));
      
        // Convert the task length to a number
        let taskLength = parseInt(this.taskLength);
        let urgencyR = 0.0;
      
        while (Math.abs(hoursUntilTask) > 0) {
          hoursUntilTask -= 1;
          urgencyR -= 0.5;
        }
      
        while (taskLength > 0) {
          taskLength -= 0.5;
          urgencyR += 0.5;
        }
      
        this.urgency = urgencyR; // Set the task's urgency property
        return this.urgency;
      }
  }

  
  
  // Calendar class
  class Calendar {
    constructor() {
      this.tasks = [];
      this.constantTasks = [];
      this.nextTaskId = 0;

    }
    
  
    addTask() {
      const taskName = document.getElementById("task-name").value;
      const taskDate = document.getElementById("task-date").value;
      const taskTime = document.getElementById("task-time").value + ":00";
      const taskLength = document.getElementById("task-length").value;
      // random id generator
      const id = Math.floor(Math.random() * 1000000000);

      // Create a new Task object
      const task = new Task(id, taskName, taskDate, taskTime, taskLength);
      this.tasks.push(task);
      task.isConstant = document.getElementById("task-constant").checked;
      //if task-daily is selected, set task.isDaily to true. Task-daily is an option not a checkbox
      if (document.getElementById("task-daily").selected) {
        task.isDaily = true;
      } else {
        task.isDaily = false;
      }
      //if task-weekly is selected, set task.isWeekly to true. Task-weekly is an option not a checkbox
      if (document.getElementById("task-weekly").selected) {
        task.isWeekly = true;
      } else {
        task.isWeekly = false;
      }

      // Convert taskLength to a number
      const taskLengthNum = parseInt(taskLength);
  
      // Create a new Date object for the start time
      const startTime = new Date(`${taskDate}T${taskTime}`);
  
      // Set the end time by adding the taskLength (in hours) to the start time
      const endTime = new Date(
        startTime.getTime() + taskLengthNum * 60 * 60 * 1000
      );
    
      // Create a new event object for the FullCalendar Calendar object
      const event = {
        id: id,
        title: taskName,
        start: startTime,
        end: endTime,
      };
  
      // Add the event to the FullCalendar Calendar object
      fullCalendarCalendar.addEvent(event);

      console.log(task.date);
      // Update the task list to display the new task
      const taskList = document.getElementById("task-list");
      const newTask = document.createElement("li");
      newTask.textContent = `${task.toString()} - ${task.urgencyRating()}`;
      taskList.appendChild(newTask);
      saveTasksToFirestore(calendar);
    }

    getTaskById(id) {
        // Search the tasks array for a task with a matching id
        for (const task of this.tasks) {
          if (task.id === id) {
            return task;
          }
        }
      
      }
  
    listTasks() {
      return this.tasks.map((task) => task.toString());
    }
  
    getTasks(calendar) {
      const tasks = [];
      for (const task of calendar.tasks) {
        tasks.push(task);
      }
      tasks.sort((a, b) => b.urgency - a.urgency);
  
      let currentTime = new Date(); // Initialize currentTime to the current date and time
  
      // Clear the FullCalendar calendar
      fullCalendarCalendar.removeAllEvents();
  
      for (const task of tasks) {
        if (task.isConstant) {
          // print task id to console

          // Convert taskLength to a number
          task.taskLength = parseInt(task.taskLength);
  
          // Create a new Date object for the start time
          const startTime = new Date(`${task.date}T${task.time}`);
  
          // Set the end time by adding the taskLength (in hours) to the start time
          const endTime = new Date(startTime.getTime() + task.taskLength * 60 * 60 * 1000);
          // Create a new event object for the FullCalendar Calendar object
          const event = {
            title: task.name,
            start: startTime,
            end: endTime,
          };
  
          fullCalendarCalendar.addEvent(event);
        } else {
          let startTime = currentTime; // Set the start time of the task to currentTime
          let taskLengthNum = parseInt(task.taskLength); // Convert the task length to a number
          let endTime = new Date(
            startTime.getTime() + taskLengthNum * 60 * 60 * 1000 // Set the end time by adding the task length (in hours) to the start time
          );
  
          // Check if the task overlaps with any of the other tasks
          for (const otherTask of tasks) {
            // Skip the current task
            if (task === otherTask) continue;
  
            // Convert the task length of the other task to a number
            const otherTaskLengthNum = parseInt(otherTask.taskLength);
  
            // Calculate the start and end times of the other task
            const otherTaskStartTime = new Date(
              `${otherTask.date}T${otherTask.time}`
            );
            const otherTaskEndTime = new Date(
              otherTaskStartTime.getTime() + otherTaskLengthNum * 60 * 60 * 1000
            );
            // Check if the current task overlaps with the other task
            if (
              startTime.getTime() < otherTaskEndTime.getTime() &&
              endTime.getTime() > otherTaskStartTime.getTime()
            ) {
              // Adjust the start and end times of the current task so that it does not overlap with the other task
  
              startTime = new Date(otherTaskEndTime.getTime());
              endTime = new Date(
                startTime.getTime() + taskLengthNum * 60 * 60 * 1000
              );
            }
          }
  
          // Update currentTime to the end time of the task
          currentTime = endTime;
  
          // Create a new event object for the FullCalendar Calendar object
          const event = {
            title: task.name,
            start: startTime,
            end: endTime,
          };
          fullCalendarCalendar.addEvent(event);
          saveTasksToFirestore(calendar);
        }
      }
    }
  }

  // function to log the full task list to the console when the log-tasks-button is clicked
  function logTasks() {
    console.log(calendar.listTasks());
  }

  function saveTasksToFirestore(calendar) {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('User not logged in');
      return;
    }
    const tasksRef = db.collection('users').doc(user.uid).collection('tasks');
  
    // Clear the tasks collection for this user
    tasksRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    }).then(() => {
  
      // Add each task in the calendar to the tasks collection for this user
      for (const task of calendar.tasks) {
        tasksRef.add({
          id: task.id,
          name: task.name,
          date: task.date,
          time: task.time,
          taskLength: task.taskLength,
          isConstant: task.isConstant,
          isDaily: task.isDaily,
          isWeekly: task.isWeekly,
          urgency: task.urgency,
        });
        // Print task id to console
      }
      // Print a message to the console to indicate that the tasks have been saved
      console.log('Tasks saved to Firestore');
    }).catch((error) => {
      console.error('Error clearing or saving tasks: ', error);
    });
  }

  //everytime the page is loaded, the tasks are loaded from firestore
  function loadTasksFromFirestore() {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('User not logged in');
      return;
    }
    const tasksRef = db.collection('users').doc(user.uid).collection('tasks');
    
    // Clear the tasks array
    calendar.tasks = [];

    // Add each task in the tasks collection for this user to the calendar
    tasksRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        
        //add the info in task to the calendar array without the taskadd function
        
        // Create a new Task object
        const newTask = new Task(task.id, task.name, task.date, task.time, task.taskLength, task.isConstant, task.isDaily, task.isWeekly, task.urgency);
        // Add the new task to the calendar
        calendar.tasks.push(newTask);

        // Create a new event object for the FullCalendar Calendar object
        const event = {
          id: task.id,
          title: task.name,
          start: `${task.date}T${task.time}`,
          end: new Date(`${task.date}T${task.time}`).getTime() + parseInt(task.taskLength) * 60 * 60 * 1000,
        };
        fullCalendarCalendar.addEvent(event);
        
      });
    }).then(() => {
      // Print a message to the console to indicate that the tasks have been loaded
      console.log('Tasks loaded from Firestore');
    }).catch((error) => {
      console.error('Error loading tasks: ', error);
    });
  }


  
  // Update the onclick handlers to use the Calendar instance's methods
  const calendar = new Calendar();
  // document.getElementById("Save").onclick = () => saveTasksToFirestore(calendar);
  document.getElementById("add-task-button").onclick = () =>
    calendar.addTask(fullCalendarCalendar);
  document.getElementById("sort-tasks-button").onclick = () =>
    calendar.getTasks(calendar);
  document.getElementById("log-tasks-button").onclick = () => logTasks();

  