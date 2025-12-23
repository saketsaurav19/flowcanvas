import React, { useState } from 'react';
import styles from '../CSS/GeminiPromptModal.module.css';

const GeminiPromptModal = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_gemini_model') || 'models/gemini-2.5-flash';
    }
    return 'models/gemini-2.5-flash';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = React.useRef(null);

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    localStorage.setItem('selected_gemini_model', newModel);
  };

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await onGenerate(prompt, selectedModel, controller.signal);
      onClose();
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Generation stopped by user.");
      } else {
        setError(err.message || "Failed to generate flow. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopClick = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
            <label className={styles.label}>Select Model</label>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className={styles.select}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                marginBottom: '15px'
              }}
            >
              <option value="models/gemini-3-pro-preview">Gemini 3.0 Pro (preview)</option>
              <option value="models/gemini-3-flash-preview">Gemini 3.0 flash</option>
              <option value="models/gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="models/gemini-2.5-flash-lite">Gemini 2.5 Flash lite</option>
              <option value="models/gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="models/gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="models/gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>

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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleGenerateClick}
              className={styles.generateButton}
              disabled={isLoading || !prompt.trim()}
              style={{ flex: 1 }}
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

            {isLoading && (
              <button
                onClick={handleStopClick}
                className={styles.stopButton}
                style={{
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiPromptModal;
