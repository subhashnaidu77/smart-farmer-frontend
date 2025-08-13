import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        show: false,
        message: '',
        type: 'info', // 'info', 'success', or 'error'
    });

    const showModal = (message, type = 'info') => {
        setModalState({ show: true, message, type });
    };

    const hideModal = () => {
        setModalState({ show: false, message: '', type: 'info' });
    };

    const value = { ...modalState, showModal, hideModal };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    return useContext(ModalContext);
};