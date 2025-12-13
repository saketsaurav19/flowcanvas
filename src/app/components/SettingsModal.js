import React, { useState, useEffect } from 'react';
import styles from '../CSS/SettingsModal.module.css';

const SettingsModal = ({ onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSave = () => {
        try {
            localStorage.setItem('gemini_api_key', apiKey);
            setMessage({ type: 'success', text: 'API Key saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save API Key.' });
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Settings</h3>
                    <button onClick={onClose} className={styles.closeButton}>✖</button>
                </div>
                <div className={styles.content}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your Gemini API Key"
                            className={styles.input}
                        />
                    </div>
                    <button onClick={handleSave} className={styles.saveButton}>
                        Save Settings
                    </button>
                    {message && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
