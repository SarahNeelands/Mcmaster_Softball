/**
 * Footer.tsx
 * -----------
 * Site footer component presenting league contact information and social links.
 */

import React from "react";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.content}>
        <h3 className={styles.heading}>McMaster GSA Softball League</h3>
        <a href="mailto:softballgsa@gmail.com" className={styles.link}>
          Contact us at softballgsa@gmail.com
        </a>
        <a
          href="https://www.instagram.com/softballgsa/"
          className={styles.socialLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Visit the McMaster GSA Softball League Instagram page"
        >
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.38-2.63a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26Z"
              fill="currentColor"
            />
          </svg>
          <span>@softballgsa</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
