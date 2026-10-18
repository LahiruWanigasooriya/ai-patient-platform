"use client";

import { useState, useEffect } from "react";

export interface ResizableSidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
}

export function ResizableSidebar({
  isOpen,
  children,
  defaultWidth = 440,
  minWidth = 340,
  maxWidth = 1100,
  storageKey = "medintel-chat-sidebar-width",
}: ResizableSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(defaultWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Load saved sidebar width from localStorage on mount
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= 1200) {
          setSidebarWidth(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey, minWidth]);

  // Dragging logic for left margin splitter (similar to browser inspection panel)
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const boundedMax = Math.max(minWidth, Math.min(window.innerWidth - 320, maxWidth));
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), boundedMax);
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(storageKey, sidebarWidth.toString());
      } catch {
        // ignore
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const newWidth = window.innerWidth - e.touches[0].clientX;
      const boundedMax = Math.max(minWidth, Math.min(window.innerWidth - 80, maxWidth));
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), boundedMax);
      setSidebarWidth(clampedWidth);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(storageKey, sidebarWidth.toString());
      } catch {
        // ignore
      }
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, sidebarWidth, minWidth, maxWidth, storageKey]);

  return (
    <div 
      style={{ width: isOpen ? `${sidebarWidth}px` : '0px' }}
      className={`h-full border-l border-gray-200 dark:border-gray-800 z-30 relative flex-shrink-0 ${
        isDragging ? 'transition-none' : 'transition-[width] duration-300 ease-in-out'
      } ${isOpen ? 'visible' : 'invisible overflow-hidden border-none'}`}
    >
      {/* Left Margin Resize Drag Handle */}
      {isOpen && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={() => setIsDragging(true)}
          onDoubleClick={() => {
            setSidebarWidth(defaultWidth);
            try {
              localStorage.setItem(storageKey, defaultWidth.toString());
            } catch {}
          }}
          className={`absolute -left-1.5 top-0 bottom-0 w-3 z-40 cursor-col-resize group flex items-center justify-center select-none ${
            isDragging ? 'bg-emerald-500/20' : 'hover:bg-emerald-500/10'
          }`}
          title="Drag left/right to resize AI Assistant panel (Double-click to reset)"
        >
          {/* Visual separator line on hover/active */}
          <div className={`w-0.5 h-full transition-colors duration-150 ${
            isDragging ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-500/70'
          }`} />

          {/* Subtle grab pill indicator */}
          <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-9 rounded-full transition-all duration-150 shadow-2xs ${
            isDragging 
              ? 'bg-emerald-600 scale-110' 
              : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-emerald-500 group-hover:scale-110'
          }`} />
        </div>
      )}

      <div className="h-full w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
