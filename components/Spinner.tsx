/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-solid border-blue-500 border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    ></div>
  );
};

export default Spinner;
