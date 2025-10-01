import React, { useState } from 'react';
import '../styles/AcceptDeclineComponent.css';

const AcceptDeclineComponent = ({ deliveryId, onStatusChange, supplierAccepted }) => {
    // If supplier has already made a decision, show the status
    if (supplierAccepted === true) {
        return (
            <div className="status-display accepted-status">
                <span className="status-icon">✅</span>
                <span className="status-text">Accepted</span>
            </div>
        );
    } else if (supplierAccepted === false) {
        return (
            <div className="status-display declined-status">
                <span className="status-icon">❌</span>
                <span className="status-text">Declined</span>
            </div>
        );
    }
    
    // If no decision has been made yet, show the accept/decline buttons
    const handleAccept = () => {
        onStatusChange(deliveryId, 'accept');
    };

    const handleDecline = () => {
        onStatusChange(deliveryId, 'decline');
    };

    return (
        <div className="accept-decline-container">
            <button className="accept-button" onClick={handleAccept}>
                <span className="option-icon">✅</span>
                <span className="option-label">Accept</span>
            </button>
            <button className="decline-button" onClick={handleDecline}>
                <span className="option-icon">❌</span>
                <span className="option-label">Decline</span>
            </button>
        </div>
    );
};

export default AcceptDeclineComponent;