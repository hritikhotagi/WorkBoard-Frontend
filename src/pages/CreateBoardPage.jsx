import React, { useState, useEffect } from "react";
import { getUsers, createBoard } from "../api/api"; // Import the API function to get users and create board
import "../styles/CreateBoardPage.css"; // Import your specific styles here

const CreateBoardPage = () => {
    const [boardTitle, setBoardTitle] = useState("");
    const [boardDescription, setBoardDescription] = useState("");
    const [tasks, setTasks] = useState([]);
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        status: "todo",
        user: "",
    });
    const [editingTaskIndex, setEditingTaskIndex] = useState(null); // To track if we are editing an existing task
    const [users, setUsers] = useState([]); // State for storing user list fetched from API
    const [searchQuery, setSearchQuery] = useState(""); // State for search in the dropdown
    const [taskError, setTaskError] = useState(""); // Error message for task validation

    useEffect(() => {
        // Fetch the users from the API
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers); // Set users to the fetched list
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers(); // Call the function when the component mounts
    }, []);

    // Handle form submission (create board and tasks)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user || !user.id) {
            alert("No valid user found. Please log in again.");
            return;
        }

        if (!boardTitle.trim()) {
            alert("Board title is required.");
            return;
        }

        // Prepare the board data
        const workBoardData = {
            title: boardTitle,
            description: boardDescription,
            owner: user.id, // Owner is taken from localStorage
            tasks: tasks.map((task) => ({
                title: task.title,
                description: task.description || "",
                status: task.status,
                assigned_to_id: users.find((u) => u.username === task.user)?.id || null, // Convert user name to ID
            })),
        };

        try {
            const response = await createBoard(workBoardData); // Call the createBoard API
            if (response) {
                // Show the success message
                alert("Work board created successfully!");
                // Redirect to homepage after successful creation
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Error creating the workboard:", error);
            if (error.response) {
                alert(`Error: ${error.response.data}`);
            } else {
                alert("An error occurred while creating the work board.");
            }
        }
    };

    // Add or Update Task
    const handleAddOrUpdateTask = () => {
        // Validate task form fields before adding or updating
        if (!taskForm.title.trim()) {
            setTaskError("Task title is required.");
            return;
        }
        setTaskError(""); // Clear error after validation passes

        if (editingTaskIndex !== null) {
            // Update the existing task
            const updatedTasks = [...tasks];
            updatedTasks[editingTaskIndex] = taskForm;
            setTasks(updatedTasks);
            setEditingTaskIndex(null); // Reset the editing index
        } else {
            // Add a new task
            setTasks([...tasks, taskForm]);
        }
        // Reset the form fields for the next task
        setTaskForm({ title: "", description: "", status: "todo", user: "" });
    };

    // Handle Edit Button
    const handleEditTask = (index) => {
        const taskToEdit = tasks[index];
        setTaskForm(taskToEdit); // Populate the form with the task data
        setEditingTaskIndex(index); // Track which task is being edited
    };

    // Handle task form changes
    const handleTaskFormChange = (field, value) => {
        setTaskForm({ ...taskForm, [field]: value });
    };

    // Filter users based on the search query
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="create-board-page">
            <div className="create-board-left">
                <h2>Create a WorkBoard</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Board Title</label>
                        <input
                            type="text"
                            value={boardTitle}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Board Description</label>
                        <textarea
                            value={boardDescription}
                            onChange={(e) => setBoardDescription(e.target.value)}
                        />
                    </div>

                    {/* Task Input */}
                    <div className="form-group task-input">
                        <h3>Add Task</h3>
                        {taskError && <p className="error-message">{taskError}</p>}
                        <input
                            type="text"
                            placeholder="Task Title"
                            value={taskForm.title}
                            onChange={(e) => handleTaskFormChange("title", e.target.value)}
                        />
                        <textarea
                            className="textbox1"
                            placeholder="Task Description (Optional)"
                            value={taskForm.description}
                            onChange={(e) =>
                                handleTaskFormChange("description", e.target.value)
                            }
                        />

                        {/* Status Dropdown */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={taskForm.status}
                                onChange={(e) => handleTaskFormChange("status", e.target.value)}
                            >
                                <option value="todo">todo</option>
                                <option value="in_progress">in_progress</option>
                                <option value="completed">completed</option>
                            </select>
                        </div>

                        {/* User Assignment with dropdown (optional now) */}
                        <div className="form-group">
                            <label>Assign to a User (optional)</label>
                            <input
                                type="text"
                                placeholder="Search user"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // Search query input
                            />
                            <select
                                value={taskForm.user}
                                onChange={(e) => handleTaskFormChange("user", e.target.value)}
                                className="user-dropdown"
                            >
                                <option value="">Select a User</option>
                                {filteredUsers.map((user) => (
                                    <option key={user.id} value={user.username}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddOrUpdateTask}
                            className="add-task-btn"
                        >
                            {editingTaskIndex !== null ? "Update Task" : "Add Task"}
                        </button>
                    </div>
                    <button
                        className="back-button"
                        onClick={() => (window.location.href = "/")}
                    >
                        Back
                    </button>

                    <button type="submit" className="submit-btn">
                        Create Work Board
                    </button>
                </form>
            </div>

            {/* Task List Display on the right */}
            <div className="create-board-right">
                <h3>Tasks</h3>
                <div className="task-list">
                    {tasks.map((task, index) => (
                        <div key={index} className="task-card">
                            <div className="task-card-header">
                                <h4>{task.title}</h4>
                                <button
                                    className="edit-task-btn"
                                    onClick={() => handleEditTask(index)}
                                >
                                    Edit
                                </button>
                            </div>
                            <p>{task.description || "No description provided"}</p>
                            <div className="task-card-footer">
                                <span className="task-status">{task.status}</span>
                                {task.user && (
                                    <span className="user-avatar">{task.user.charAt(0)}</span>
                                )}{" "}
                                {/* Avatar based on user initial */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreateBoardPage;
