import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Avatar } from 'antd';

const TaskCard = ({ task, index, onEdit }) => {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            backgroundColor: snapshot.isDragging ? 'lightgreen' : 'white',
            ...provided.draggableProps.style,
          }}
        >
          <div className="task-content">
            <p>{task.title}</p>
            <Avatar
              src={`https://joesch.moe/api/v1/random?key=${task.id}`}
              alt="User Avatar"
            />
          </div>
          <button onClick={() => onEdit(task)}>Edit</button>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
