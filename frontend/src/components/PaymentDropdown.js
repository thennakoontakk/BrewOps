import React, { useState } from 'react';
import '../styles/PaymentDropdown.css';

const PaymentDropdown = ({ deliveryId, currentStatus, onPaymentSelect, selectedPayment }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const paymentOptions = [
        { value: 'spot', label: 'Spot Payment', icon: '💰' },
        { value: 'monthly', label: 'Monthly Payment', icon: '📅' }
    ];

    const updatePaymentMethodInDB = async (paymentMethod) => {
        try {
            setIsUpdating(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/delivery/payment/${deliveryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ payment_method: paymentMethod })
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Failed to update payment method:', data.message);
            }
        } catch (error) {
            console.error('Error updating payment method:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePaymentSelect = (paymentMethod) => {
        onPaymentSelect(deliveryId, paymentMethod);
        updatePaymentMethodInDB(paymentMethod);
        setShowOptions(false);
    };

    const getStatusDisplay = () => {
        // If a payment method is already selected
        if (selectedPayment) {
            const option = paymentOptions.find(opt => opt.value === selectedPayment);
            if (option) {
                return (
                    <div className="status-display" data-status={option.value}>
                        <span className="status-icon">{option.icon}</span>
                        <span className="status-text">{option.label}</span>
                    </div>
                );
            }
        }
        
        // Check if status is pending (case insensitive)
        const isPending = currentStatus && currentStatus.toLowerCase().includes('pending');
        
        if (isPending) {
            return (
                <div className="status-display pending-status" onClick={() => setShowOptions(!showOptions)}>
                    <span className="status-text">Select Payment</span>
                    <span className="dropdown-arrow">▼</span>
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
                        <span className="status-text">{currentStatus || 'Select Payment'}</span>
                        <span className="dropdown-arrow" onClick={() => setShowOptions(!showOptions)}>▼</span>
                    </div>
                );
            }
        }
    };

    return (
        <div className="payment-dropdown">
            {getStatusDisplay()}
            
            {showOptions && (
                <div className="payment-options">
                    <div className="payment-option-group">
                        <h4>Select Payment Method:</h4>
                        {paymentOptions.map(option => (
                            <button 
                                key={option.value} 
                                className={`payment-option ${selectedPayment === option.value ? 'selected' : ''}`}
                                onClick={() => handlePaymentSelect(option.value)}
                            >
                                <span className="option-icon">{option.icon}</span>
                                <span className="option-label">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentDropdown;