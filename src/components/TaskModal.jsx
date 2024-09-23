import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const TaskModal = ({ isOpen, onClose, onSubmit, status, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setAssignedTo('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      title,
      status,
    };

    if (assignedTo && assignedTo !== '0') {
      taskData.assigned_to = Number(assignedTo);
      taskData.assigned_to_id = Number(assignedTo);
    } else {
      taskData.assigned_to = null;
      taskData.assigned_to_id = null;
    }

    if (description.trim()) {
      taskData.description = description;
    }

    onSubmit(taskData);
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Assigned To</label>
            <select
              className="form-control"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="0">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary">
            Create Task
          </Button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
