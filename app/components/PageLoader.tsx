'use client';

import { useEffect, useState } from 'react';
import { FullPageLoader } from '@/components/ui/loader';

interface PageLoaderProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

/**
 * Wrapper component that shows a full-page loader until the page is ready.
 * Use this to wrap page content and control when it becomes visible.
 */
export default function PageLoader({ 
  children, 
  isLoading = false,
  loadingMessage 
}: PageLoaderProps) {
  const [isPageReady, setIsPageReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if document is already ready
    const checkReady = () => {
      if (document.readyState === 'complete') {
        // Wait a bit more to ensure all React components are rendered
        setTimeout(() => {
          setIsPageReady(true);
        }, 150);
      } else {
        // Wait for document to be ready, then wait a bit more for React rendering
        const handleLoad = () => {
          setTimeout(() => {
            setIsPageReady(true);
          }, 150);
        };
        
        if (document.readyState === 'interactive') {
          handleLoad();
        } else {
          window.addEventListener('load', handleLoad);
          return () => window.removeEventListener('load', handleLoad);
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      checkReady();
    });
  }, []);

  // Show loader if explicitly loading or page not ready yet
  if (!isMounted || isLoading || !isPageReady) {
    return <FullPageLoader message={loadingMessage} />;
  }

  return <>{children}</>;
}
