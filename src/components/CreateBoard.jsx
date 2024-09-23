import React, { useState, useEffect } from 'react';
import { getUsers } from '../api/api'; // Import the API function to get users
import '../styles/CreateBoardPage.css'; // Import your specific styles here

const CreateBoardPage = () => {
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'To-Do', user: '' });
  const [editingTaskIndex, setEditingTaskIndex] = useState(null); // To track if we are editing an existing task
  const [users, setUsers] = useState([]); // State for storing user list fetched from API
  const [searchQuery, setSearchQuery] = useState(''); // State for search in the dropdown

  useEffect(() => {
    // Fetch the users from the API
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers); // Set users to the fetched list
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers(); // Call the function when the component mounts
  }, []);

  // Handle form submission (create board and tasks)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your logic to save the board and tasks to your backend (e.g., Django API)
    console.log('Board Title:', boardTitle);
    console.log('Board Description:', boardDescription);
    console.log('Tasks:', tasks);
  };

  // Add or Update Task
  const handleAddOrUpdateTask = () => {
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
    setTaskForm({ title: '', description: '', status: 'To-Do', user: '' });
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

         
          <div className="form-group task-input">
            <h3>Add Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              value={taskForm.title}
              onChange={(e) => handleTaskFormChange('title', e.target.value)}
              required
            />
            <textarea
              placeholder="Task Description (Optional)"
              value={taskForm.description}
              onChange={(e) => handleTaskFormChange('description', e.target.value)}
            />

            
            <div className="form-group">
              <label>Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => handleTaskFormChange('status', e.target.value)}
              >
                <option value="To-Do">To-Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            
            <div className="form-group">
              <label>Assign to a User</label>
              <input
                type="text"
                placeholder="Search user"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <select
                value={taskForm.user}
                onChange={(e) => handleTaskFormChange('user', e.target.value)}
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

            <button type="button" onClick={handleAddOrUpdateTask} className="add-task-btn">
              {editingTaskIndex !== null ? 'Update Task' : 'Add Task'}
            </button>
          </div>

          <button type="submit" className="submit-btn">Create Work Board</button>
        </form>
      </div>

      <div className="create-board-right">
        <h3>Tasks</h3>
        <div className="task-list">
          {tasks.map((task, index) => (
            <div key={index} className="task-card">
              <div className="task-card-header">
                <h4>{task.title}</h4>
                <button className="edit-task-btn" onClick={() => handleEditTask(index)}>Edit</button>
              </div>
              <p>{task.description || 'No description provided'}</p>
              <div className="task-card-footer">
                <span className="task-status">{task.status}</span>
                <span className="user-avatar">{task.user.charAt(0)}</span> 
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateBoardPage;
