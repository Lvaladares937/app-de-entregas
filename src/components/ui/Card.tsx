import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div
      className={`glass-effect rounded-2xl shadow-soft p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-purple hover:scale-[1.02] hover:border-purple-300' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
