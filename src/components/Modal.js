import React from 'react';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import './Modal.css'; // We will create this CSS file next

const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    info: <FiInfo />,
};

const Modal = ({ show, message, type, onClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content card">
                <div className={`modal-icon ${type}`}>
                    {icons[type] || <FiInfo />}
                </div>
                <h3 className="modal-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <p className="modal-message">{message}</p>
                <button className="btn btn-primary" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;