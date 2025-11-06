
import React from 'react';
import styles from '../CSS/FileListOverlay.module.css';

const FileListOverlay = ({ files, onSelect, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2>Select a file to load</h2>
        <ul className={styles.fileList}>
          {files.map(file => (
            <li key={file} onClick={() => onSelect(file)} className={styles.fileListItem}>
              {file}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default FileListOverlay;