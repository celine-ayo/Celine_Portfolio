// Shared navigation and small page interactions.
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu",
      );
      menuButton.textContent = isOpen ? "×" : "☰";
    });
  }

  // Contact form validation is local only. It does not send or store messages.
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const feedback = document.getElementById("formFeedback");
    const fields = ["name", "email", "subject", "message"];

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      fields.forEach((field) => {
        const input = contactForm.elements[field];
        const error = contactForm.querySelector(`[data-error-for="${field}"]`);
        let message = "";
        if (!input.value.trim()) message = "This field is required.";
        else if (field === "name" && input.value.trim().length < 2)
          message = "Please enter your name.";
        else if (
          field === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
        )
          message = "Enter a valid email address.";
        else if (field === "subject" && input.value.trim().length < 3)
          message = "Please add a short subject.";
        else if (field === "message" && input.value.trim().length < 10)
          message = "Please write at least 10 characters.";
        if (error) error.textContent = message;
        input.setAttribute("aria-invalid", String(Boolean(message)));
        if (message) valid = false;
      });
      if (!valid) {
        feedback.textContent =
          "Please check the highlighted fields and try again.";
        feedback.classList.remove("success");
        return;
      }
      feedback.textContent =
        "Thank you. Your details are valid. This demo form does not send the message.";
      feedback.classList.add("success");
      contactForm.reset();
      fields.forEach((field) => {
        const error = contactForm.querySelector(`[data-error-for="${field}"]`);
        if (error) error.textContent = "";
        contactForm.elements[field].removeAttribute("aria-invalid");
      });
    });
  }

  // The planner stores tasks only in this browser.
  const taskForm = document.getElementById("taskForm");
  if (taskForm) {
    const titleInput = document.getElementById("taskTitle");
    const dateInput = document.getElementById("taskDate");
    const categoryInput = document.getElementById("taskCategory");
    const taskList = document.getElementById("taskList");
    const taskCount = document.getElementById("taskCount");
    const saveButton = document.getElementById("saveTask");
    const cancelButton = document.getElementById("cancelEdit");
    const formTitle = document.getElementById("taskFormTitle");
    let tasks = [];
    let filter = "all";
    let editingId = null;
    try {
      tasks = JSON.parse(localStorage.getItem("celinePlannerTasks") || "[]");
    } catch {
      tasks = [];
    }

    const save = () =>
      localStorage.setItem("celinePlannerTasks", JSON.stringify(tasks));
    const resetForm = () => {
      taskForm.reset();
      editingId = null;
      saveButton.innerHTML = "Add task <span>＋</span>";
      cancelButton.classList.add("hidden");
      formTitle.textContent = "Add a task";
    };
    const render = () => {
      taskList.querySelectorAll(".task-item").forEach((item) => item.remove());
      const visible = tasks.filter(
        (task) =>
          filter === "all" ||
          (filter === "active" && !task.done) ||
          (filter === "done" && task.done),
      );
      const empty = document.getElementById("emptyState");
      if (empty) empty.style.display = visible.length ? "none" : "block";
      taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
      visible.forEach((task) => {
        const item = document.createElement("article");
        item.className = `task-item${task.done ? " completed" : ""}`;
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = task.done;
        check.setAttribute("aria-label", `Mark ${task.title} complete`);
        check.addEventListener("change", () => {
          task.done = check.checked;
          save();
          render();
        });
        const content = document.createElement("div");
        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;
        const meta = document.createElement("span");
        meta.className = "task-meta";
        meta.textContent = `${task.category}${task.date ? " · Due " + task.date : ""}`;
        content.append(title, meta);
        const actions = document.createElement("div");
        actions.className = "task-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "✎";
        edit.setAttribute("aria-label", `Edit ${task.title}`);
        edit.addEventListener("click", () => {
          titleInput.value = task.title;
          dateInput.value = task.date || "";
          categoryInput.value = task.category;
          editingId = task.id;
          saveButton.innerHTML = "Save changes <span>✓</span>";
          cancelButton.classList.remove("hidden");
          formTitle.textContent = "Edit task";
          titleInput.focus();
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Delete ${task.title}`);
        remove.addEventListener("click", () => {
          tasks = tasks.filter((entry) => entry.id !== task.id);
          save();
          render();
          if (editingId === task.id) resetForm();
        });
        actions.append(edit, remove);
        item.append(check, content, actions);
        taskList.append(item);
      });
    };
    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = titleInput.value.trim();
      if (!title) return;
      const details = {
        title,
        date: dateInput.value,
        category: categoryInput.value,
      };
      if (editingId) {
        tasks = tasks.map((task) =>
          task.id === editingId ? { ...task, ...details } : task,
        );
      } else
        tasks.unshift({
          ...details,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          done: false,
        });
      save();
      resetForm();
      render();
    });
    cancelButton.addEventListener("click", resetForm);
    document.querySelectorAll(".filter-button").forEach((button) =>
      button.addEventListener("click", () => {
        filter = button.dataset.filter;
        document
          .querySelectorAll(".filter-button")
          .forEach((entry) =>
            entry.classList.toggle("active", entry === button),
          );
        render();
      }),
    );
    render();
  }
});
