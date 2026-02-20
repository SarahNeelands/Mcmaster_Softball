/**
 * Card.tsx
 * ---------
 * Reusable surface component providing consistent padding, background, and
 * shadow styling for content blocks throughout the site.
 */

import React, { PropsWithChildren } from "react";
import styles from "./Card.module.css";

interface CardProps {
  className?: string;
}

const Card: React.FC<PropsWithChildren<CardProps>> = ({ children, className }) => {
  const combinedClassName = className ? `${styles.card} ${className}` : styles.card;
  return <div className={combinedClassName}>{children}</div>;
};

export default Card;
