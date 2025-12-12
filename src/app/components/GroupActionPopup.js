import React from 'react';
import styles from '../CSS/GroupActionPopup.module.css';

const GroupActionPopup = ({ onConfirm, onCancel }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h3>Add to Group?</h3>
                <p>Do you want to add this node to the group?</p>
                <div className={styles.buttonGroup}>
                    <button onClick={onConfirm} className={styles.addButton}>
                        Add to Group
                    </button>
                    <button onClick={onCancel} className={styles.cancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupActionPopup;
