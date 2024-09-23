import React, { useState, useEffect } from "react";
import { getUsers, createBoard } from "../api/api";
import "../styles/CreateBoardPage.css";

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
    const [editingTaskIndex, setEditingTaskIndex] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [taskError, setTaskError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

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

        const workBoardData = {
            title: boardTitle,
            description: boardDescription,
            owner: user.id,
            tasks: tasks.map((task) => ({
                title: task.title,
                description: task.description || "",
                status: task.status,
                assigned_to_id: users.find((u) => u.username === task.user)?.id || null,
            })),
        };

        try {
            const response = await createBoard(workBoardData);
            if (response) {
                alert("Work board created successfully!");
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

    const handleAddOrUpdateTask = () => {
        if (!taskForm.title.trim()) {
            setTaskError("Task title is required.");
            return;
        }
        setTaskError("");

        if (editingTaskIndex !== null) {
            const updatedTasks = [...tasks];
            updatedTasks[editingTaskIndex] = taskForm;
            setTasks(updatedTasks);
            setEditingTaskIndex(null);
        } else {
            setTasks([...tasks, taskForm]);
        }
        setTaskForm({ title: "", description: "", status: "todo", user: "" });
    };

    const handleEditTask = (index) => {
        const taskToEdit = tasks[index];
        setTaskForm(taskToEdit);
        setEditingTaskIndex(index);
    };

    const handleTaskFormChange = (field, value) => {
        setTaskForm({ ...taskForm, [field]: value });
    };

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

                        <div className="form-group">
                            <label>Assign to a User (optional)</label>
                            <input
                                type="text"
                                placeholder="Search user"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreateBoardPage;
