import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BoardList.css';

// Helper function to generate user initials
const getInitial = (username) => {
  return username ? username.charAt(0).toUpperCase() : '';
};

// Helper function to get unique users assigned to tasks
const getUniqueUsers = (tasks) => {
  const uniqueUsers = [];
  tasks.forEach((task) => {
    if (task.assigned_to && task.assigned_to.username && !uniqueUsers.find((user) => user.id === task.assigned_to.id)) {
      uniqueUsers.push(task.assigned_to);
    }
  });
  return uniqueUsers;
};

const BoardList = ({ boards }) => {
  const storedUser = JSON.parse(localStorage.getItem('user')); // Get user from local storage
  const isOwner = storedUser && storedUser.role === 'owner'; // Check if the user is an owner

  return (
    <div className="board-list">
      {boards.map((board) => {
        const uniqueUsers = getUniqueUsers(board.tasks);
        return (
          <Link to={`/board/${board.id}`} key={board.id} className="board-card">
            <h3>{board.title}</h3>
            <p>{board.description}</p>

            <div className="board-footer">
              <span className="task-count">{board.tasks.length} Task(s)</span>
              <div className="assigned-users">
                {uniqueUsers.map((user) => (
                  <span key={user.id} className="user-avatar1">
                    {getInitial(user.username)}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        );
      })}

      {isOwner && (
        <Link to="/create-board" className="create-board-btn">
          <span>+</span>
        </Link>
      )}
    </div>
  );
};

export default BoardList;
