"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Default handle size is 50
    const [handleSize, setHandleSize] = useState(50);
    const [apiKey, setApiKey] = useState('');

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedHandleSize = localStorage.getItem('flowcanvas_handle_size');
        if (savedHandleSize) {
            setHandleSize(parseInt(savedHandleSize));
        }

        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    const updateHandleSize = (size) => {
        setHandleSize(size);
        localStorage.setItem('flowcanvas_handle_size', size);
    };

    const updateApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
    };

    return (
        <SettingsContext.Provider value={{
            handleSize,
            updateHandleSize,
            apiKey,
            updateApiKey
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
