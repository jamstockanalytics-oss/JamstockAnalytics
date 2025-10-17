import React from 'react';

interface ProModeGateProps {
  feature?: string;
  children: React.ReactNode;
}

export function ProModeGate({ children }: ProModeGateProps) {
  // Since the website is now fully free, always show children
  return <>{children}</>;
}

// Styles removed since ProModeGate now always shows children
