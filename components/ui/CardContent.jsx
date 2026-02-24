import React from 'react';

const CardContent = ({ title, children }) => {
    return (
        <div className="card-content">
            <h2>{title}</h2>
            <div>{children}</div>
        </div>
    );
};

export default CardContent;