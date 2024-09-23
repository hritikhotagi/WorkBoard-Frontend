import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoardDetails, createTask, getUsers, updateTask, updateTaskStatus } from '../api/api'; // Import updateTaskStatus
import TaskModal from './TaskModal'; // Import the modal
import '../styles/WorkBoard.css'; // Custom styles for your workboard

const WorkBoard = () => {
  const { id } = useParams(); // Get board ID from the URL
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentStatus, setCurrentStatus] = useState(''); // Track which column (+) button is clicked
  const [users, setUsers] = useState([]); // Fetch user list for assignment
  const [expandedTaskId, setExpandedTaskId] = useState(null); // Track the expanded task
  const [taskEdits, setTaskEdits] = useState({}); // State to store changes for expanded task
  const [user, setUser] = useState(null); // Store user object

  useEffect(() => {
    // Fetch user data from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    const fetchBoard = async () => {
      try {
        const boardData = await getBoardDetails(id);
        setBoard(boardData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching board details:', error);
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersData = await getUsers(); // Fetch users from API
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchBoard();
    fetchUsers(); // Fetch users when the component mounts
  }, [id]);

  const handleLogout = () => {
    // Clear auth token and user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login'); // Redirect to login page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!board) {
    return <div>Error: Could not load board details</div>;
  }

  // Group tasks by status
  const todoTasks = board.tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = board.tasks.filter((task) => task.status === 'in_progress');
  const completedTasks = board.tasks.filter((task) => task.status === 'completed');

  // Handle drag start event
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id); // Store the task ID in dataTransfer
  };

  // Handle drop event on column
  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId'); // Get the task ID
    try {
      await updateTaskStatus(taskId, newStatus); // Call API to update task status

      // Refetch the board data to reflect the updated status
      const updatedBoardData = await getBoardDetails(id);
      setBoard(updatedBoardData); // Update the board state
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Allow the column to accept dropped tasks
  const allowDrop = (e) => {
    e.preventDefault(); // Prevent default behavior to allow drop
  };

  // Open the modal with the current status
  const handleAddTask = (status) => {
    setCurrentStatus(status);
    setIsModalOpen(true);
  };

  // Handle form submission (task creation)
  const handleTaskSubmit = async (taskData) => {
    try {
      taskData.work_board = id; // Assign the current board ID
      await createTask(taskData); // This will now send the full user object
  
      // Refetch the board data to update the task list
      const updatedBoardData = await getBoardDetails(id);
      setBoard(updatedBoardData); // Update the board state with the new data
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Expand task on click
  const handleExpandTask = (task) => {
    setExpandedTaskId(task.id); // Track the task being expanded
    setTaskEdits({
      title: task.title,
      description: task.description,
      status: task.status,
      assigned_to: task.assigned_to ? task.assigned_to.id : 0, // Default to 0 if no user assigned
    });
  };

  // Handle change for text inputs or dropdowns without API call
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskEdits((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateTask = async () => {
    try {
      const updatedTask = { ...taskEdits };
  
      // Handle unassigned case by setting both `assigned_to` and `assigned_to_id` to `null`
      if (taskEdits.assigned_to === '0' || taskEdits.assigned_to === null) {
        updatedTask.assigned_to = null;
        updatedTask.assigned_to_id = null;
      } else {
        updatedTask.assigned_to = Number(taskEdits.assigned_to);
        updatedTask.assigned_to_id = Number(taskEdits.assigned_to);
      }
  
      await updateTask(expandedTaskId, updatedTask); // Call API to update task
  
      // Refetch the board to update the task list
      const updatedBoardData = await getBoardDetails(id);
      setBoard(updatedBoardData); // Update board state
      setExpandedTaskId(null); // Collapse the task
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  

  // Cancel editing
  const handleCancelEdit = () => {
    setExpandedTaskId(null);
  };

  const handleNavigateHome = () => {
    navigate('/'); // Redirect to the home page
  };

  // Render task card
  const renderTaskCard = (task) => (
    <div
      key={task.id}
      className={`task-card-custom ${expandedTaskId === task.id ? 'expanded' : ''}`}
      draggable // Make task card draggable
      onDragStart={(e) => handleDragStart(e, task)} // Handle dragging
    >
      <div className="task-card-header" onClick={() => handleExpandTask(task)}>
        <p>{task.title}</p>
        <p className="user-name">
          {task.assigned_to ? task.assigned_to.username : 'Unassigned'}
        </p>
      </div>
      {expandedTaskId === task.id && (
        <div className="task-card-body">
          <textarea
            name="description"
            value={taskEdits.description}
            onChange={handleInputChange}
            placeholder="Update description"
          />
          <select
            name="assigned_to"
            value={taskEdits.assigned_to}
            onChange={handleInputChange}
          >
            <option value={0}>Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <select
            name="status"
            value={taskEdits.status}
            onChange={handleInputChange}
          >
            <option value="todo">To-Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={handleUpdateTask}>OK</button>
          <button onClick={handleCancelEdit} className="close-btn">&times;</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="work-board-page">
      <div className="board-header">
        <div className="title-section">
          <h1>
            <span className='myworkboards' onClick={handleNavigateHome} style={{ cursor: 'pointer' }}>
              My WorkBoards /
            </span>
            {board.title}
          </h1>
        <p>{board.description}</p>
        </div>
        <div className="user-section">
          {user && (
            <>
              <span className="username">{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>

      <div className="board-content">
        <div className="column" onDrop={(e) => handleDrop(e, 'todo')} onDragOver={allowDrop}>
          <h3>To-Do's</h3>
          {todoTasks.map(renderTaskCard)}
          <div className="add-task-card1" onClick={() => handleAddTask('todo')}>+</div>
        </div>

        <div className="column" onDrop={(e) => handleDrop(e, 'in_progress')} onDragOver={allowDrop}>
          <h3>In Progress</h3>
          {inProgressTasks.map(renderTaskCard)}
          <div className="add-task-card1" onClick={() => handleAddTask('in_progress')}>+</div>
        </div>

        <div className="column" onDrop={(e) => handleDrop(e, 'completed')} onDragOver={allowDrop}>
          <h3>Completed</h3>
          {completedTasks.map(renderTaskCard)}
          <div className="add-task-card1" onClick={() => handleAddTask('completed')}>+</div>
        </div>
      </div>

      {/* Render the modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskSubmit}
        status={currentStatus}
        users={users}
      />
    </div>
  );
};

export default WorkBoard;
