let fullCalendarCalendar;

document.addEventListener("DOMContentLoaded", function () {
  var Calendar = FullCalendar.Calendar;
  var Draggable = FullCalendar.Draggable;

  var containerEl = document.getElementById("external-events");
  var calendarEl = document.getElementById("calendar");
  var checkbox = document.getElementById("drop-remove");

  // initialize the external events
  // -----------------------------------------------------------------

  new Draggable(containerEl, {
    itemSelector: ".fc-event",
    eventData: function (eventEl) {
      return {
        title: eventEl.innerText,
      };
    },
  });

  // initialize the calendar
  // -----------------------------------------------------------------

  fullCalendarCalendar = new Calendar(calendarEl, {
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },

    nowIndicator: true,
    editable: true,
    droppable: true, // this allows things to be dropped onto the calendar
    dayMaxEventRows: true,
    views: { 
      timeGrid: {
        dayMaxEventRows: 6 // adjust to 6 only for timeGridWeek/timeGridDay
      }
    },

    eventDrop: function (info) {

      //print infos id to console
      console.log(info.event.id);


      // Get the date of the task
      const month = `${info.event.start.getMonth() + 1}`.padStart(2, '0');
      const day = `${info.event.start.getDate()}`.padStart(2, '0');
      const year = info.event.start.getFullYear();
      const newDate = `${year}-${month}-${day}`;
      
      console.log(newDate);


      // get the time of the task
      const hour = info.event.start.getHours().toString().padStart(2, "0");
      const minute = info.event.start.getMinutes().toString().padStart(2, "0");
      const second = info.event.start.getSeconds().toString().padStart(2, "0");

      // Find the task that was dropped using its id
      const task = calendar.tasks.find((task) => task.id == info.event.id);
      //print the task name to the console

      // Update the date and time of the task
      task.date = newDate;
      task.time = `${hour}:${minute}:${second}`;

      saveTasksToFirestore(calendar);

      
    },
    eventResize: function (info) {
      const task = calendar.tasks.find((task) => task.id == info.event.id);

      // Get the hour, minute, and second of the start time of the task
      const hour = info.event.start.getHours().toString().padStart(2, "0");
      const minute = info.event.start.getMinutes().toString().padStart(2, "0");
      const second = info.event.start.getSeconds().toString().padStart(2, "0");

      // Update the task length of the task
      
      task.taskLength = `${(info.event.end - info.event.start) / (60 * 60 * 1000)}`;

      
      // Update the time of the task
      task.time = `${hour}:${minute}:${second}`;
      task.urgencyRating(); 
      console.log(task.taskLength);

      saveTasksToFirestore(calendar);
    },
    eventClick: function (info) {
      // if the task is clicked again, remove the delete button
      if (info.el.querySelector(".delete-button")) {
        info.el.querySelector(".delete-button").remove();
        return;
      }

      // Find the task that was clicked using its id
      const task = calendar.tasks.find((task) => task.id == info.event.id);

      // Create a delete button for the event
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete-button");

      // Add the delete button to the event element
      info.el.appendChild(deleteButton);

      // Add a click event listener to the delete button
      deleteButton.addEventListener("click", function () {
      
        // Remove the task from the tasks array
        calendar.tasks = calendar.tasks.filter((task) => task.id != info.event.id);

        // Remove the event from the FullCalendar calendar
        info.event.remove();
      });
      console.log(task);
      console.log (task.id);
    },
  });

  fullCalendarCalendar.render();
});
