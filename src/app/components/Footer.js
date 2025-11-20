"use client";
import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.text}>
                Built by <a href="https://www.instagram.com/_saket__saurav" className={styles.name}>Saket Saurav</a>
            </p>
        </footer>
    );
};

export default Footer;
