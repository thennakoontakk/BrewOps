import React from 'react';
import '../styles/PaymentDropdown.css';

const PaymentDropdown = ({ deliveryId, currentStatus, onStatusChange }) => {
    const paymentOptions = [
        { value: 'spot', label: 'Spot Payment', icon: '💰' },
        { value: 'monthly', label: 'Monthly Payment', icon: '📅' }
    ];

    const getStatusDisplay = () => {
        // Check if status is pending (case insensitive)
        const isPending = currentStatus && currentStatus.toLowerCase().includes('pending');
        
        if (isPending) {
            return (
                <div className="status-display pending-status">
                    <span className="status-text">Pending</span>
                </div>
            );
        } else {
            // Check if it's one of our payment methods
            const option = paymentOptions.find(opt => 
                currentStatus && currentStatus.toLowerCase().includes(opt.value)
            );
            
            if (option) {
                return (
                    <div className="status-display" data-status={option.value}>
                        <span className="status-icon">{option.icon}</span>
                        <span className="status-text">{option.label}</span>
                    </div>
                );
            } else {
                // For other statuses, show as is
                return (
                    <div className="status-display other-status">
                        <span className="status-text">{currentStatus}</span>
                    </div>
                );
            }
        }
    };

    return (
        <div className="payment-dropdown">
            {getStatusDisplay()}
        </div>
    );
};

export default PaymentDropdown;