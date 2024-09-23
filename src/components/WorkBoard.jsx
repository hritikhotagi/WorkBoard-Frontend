import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoardDetails, createTask, getUsers, updateTask, updateTaskStatus } from '../api/api';
import TaskModal from './TaskModal';
import '../styles/WorkBoard.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const WorkBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [taskEdits, setTaskEdits] = useState({});
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(''); // For notification banner

  useEffect(() => {
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
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchBoard();
    fetchUsers();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!board) {
    return <div>Error: Could not load board details</div>;
  }

  const todoTasks = board.tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = board.tasks.filter((task) => task.status === 'in_progress');
  const completedTasks = board.tasks.filter((task) => task.status === 'completed');

  const handleDragStart = (e, task) => {
    if (user.role !== 'viewer') {
      e.dataTransfer.setData('taskId', task.id);
    } else {
      e.preventDefault(); // Prevent drag event for viewers
    }
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const currentTask = board.tasks.find(task => task.id === Number(taskId));

    // If moving to "in_progress" or "completed", check if assigned_to is null or unassigned
    if ((newStatus === 'in_progress' || newStatus === 'completed') && !currentTask.assigned_to) {
      setNotification(`Task cannot be moved to ${newStatus === 'completed' ? 'Completed' : 'In Progress'} without an assignee.`);
      setTimeout(() => setNotification(''), 5000); // Hide notification after 5 seconds
      return; // Prevent task from moving to in_progress or completed
    }

    try {
      const updatedTask = {
        status: newStatus,
        assigned_to: currentTask.assigned_to ? currentTask.assigned_to.id : null,
      };
      await updateTaskStatus(taskId, updatedTask);
      const updatedBoardData = await getBoardDetails(id);
      setBoard(updatedBoardData);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const allowDrop = (e) => {
    if (user.role !== 'viewer') {
      e.preventDefault(); // Prevent default action to allow drop for non-viewers
    }
  };

  const handleAddTask = (status) => {
    if (user.role !== 'viewer') {
      setCurrentStatus(status);
      setIsModalOpen(true);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      taskData.work_board = id;
      await createTask(taskData);
      const updatedBoardData = await getBoardDetails(id);
      setBoard(updatedBoardData);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleExpandTask = (task) => {
    if (user.role !== 'viewer') {
      setExpandedTaskId(task.id);
      setTaskEdits({
        title: task.title,
        description: task.description,
        status: task.status,
        assigned_to: task.assigned_to ? task.assigned_to.id : 0,
      });
    }
  };

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
      if (taskEdits.assigned_to === '0' || taskEdits.assigned_to === null) {
        updatedTask.assigned_to = null;
        updatedTask.assigned_to_id = null;
      } else {
        updatedTask.assigned_to = Number(taskEdits.assigned_to);
        updatedTask.assigned_to_id = Number(taskEdits.assigned_to);
      }
      await updateTask(expandedTaskId, updatedTask);
      const updatedBoardData = await getBoardDetails(id);
      setBoard(updatedBoardData);
      setExpandedTaskId(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = () => {
    setExpandedTaskId(null);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  const renderTaskCard = (task) => (
    <div
      key={task.id}
      className={`task-card-custom ${expandedTaskId === task.id ? 'expanded' : ''}`}
      draggable={user.role !== 'viewer'} // Disable dragging for viewers
      onDragStart={(e) => handleDragStart(e, task)}
      style={{ cursor: user.role === 'viewer' ? 'not-allowed' : 'pointer' }} // Disable dragging cursor for viewers
    >
      <div
        className="task-card-header"
        onClick={() => handleExpandTask(task)} // Disable expand for viewer role
      >
        <p>{task.title}</p>
        <p className="user-name">
          {task.assigned_to ? task.assigned_to.username : 'Unassigned'}
        </p>
      </div>
      {expandedTaskId === task.id && user.role !== 'viewer' && (
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
      {notification && (
        <div className="alert alert-warning" role="alert">
          {notification}
        </div>
      )}
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
          {user && user.role === 'owner' && (
            <div className="add-task-card1" onClick={() => handleAddTask('todo')}>+</div>
          )}
        </div>

        <div className="column" onDrop={(e) => handleDrop(e, 'in_progress')} onDragOver={allowDrop}>
          <h3>In Progress</h3>
          {inProgressTasks.map(renderTaskCard)}
          {user && user.role === 'owner' && (
            <div className="add-task-card1" onClick={() => handleAddTask('in_progress')}>+</div>
          )}
        </div>

        <div className="column" onDrop={(e) => handleDrop(e, 'completed')} onDragOver={allowDrop}>
          <h3>Completed</h3>
          {completedTasks.map(renderTaskCard)}
          {user && user.role === 'owner' && (
            <div className="add-task-card1" onClick={() => handleAddTask('completed')}>+</div>
          )}
        </div>
      </div>

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
