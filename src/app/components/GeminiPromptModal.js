import React, { useState } from 'react';
import styles from '../CSS/GeminiPromptModal.module.css';

const GeminiPromptModal = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onGenerate(prompt);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to generate flow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Generate Flow with Gemini AI</h3>
          <button onClick={onClose} className={styles.closeButton} disabled={isLoading}>✖</button>
        </div>
        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>What would you like to create?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A user registration flow with email verification"
              className={styles.textarea}
              disabled={isLoading}
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}

          <button 
            onClick={handleGenerateClick} 
            className={styles.generateButton}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Generating...
              </>
            ) : (
              <>
                ✨ Generate Flow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiPromptModal;
