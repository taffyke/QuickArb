import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

interface CustomLinkProps {
  children: React.ReactNode;
  to: string;
  className?: string;
  [key: string]: any;
}

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ children, to, className = '', ...props }, ref) => {
    // External link check (starts with http or https)
    const isExternal = /^https?:\/\//.test(to);
    
    if (isExternal) {
      return (
        <a 
          href={to} 
          className={className} 
          target="_blank" 
          rel="noopener noreferrer" 
          ref={ref}
          {...props}
        >
          {children}
        </a>
      );
    }
    
    // Internal route link
    return (
      <Link 
        to={to} 
        className={className} 
        ref={ref as any}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

CustomLink.displayName = 'CustomLink'; 