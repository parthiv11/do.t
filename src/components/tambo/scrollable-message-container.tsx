"use client";

import { cn } from "@/lib/utils";
import { useTambo } from "@tambo-ai/react";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Props for the ScrollableMessageContainer component
 */
export type ScrollableMessageContainerProps =
  React.HTMLAttributes<HTMLDivElement>;

/**
 * A scrollable container for message content with auto-scroll functionality.
 * Used across message thread components for consistent scrolling behavior.
 *
 * @example
 * ```tsx
 * <ScrollableMessageContainer>
 *   <ThreadContent variant="default">
 *     <ThreadContentMessages />
 *   </ThreadContent>
 * </ScrollableMessageContainer>
 * ```
 */
export const ScrollableMessageContainer = React.forwardRef<
  HTMLDivElement,
  ScrollableMessageContainerProps
>(({ className, children, ...props }, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { thread } = useTambo();
  const [shouldAutoscroll, setShouldAutoscroll] = useState(true);
  const lastScrollTopRef = useRef(0);

  // Handle forwarded ref
  React.useImperativeHandle(ref, () => scrollContainerRef.current!, []);

  // Create a dependency that represents all content that should trigger autoscroll
  const messagesContent = React.useMemo(() => {
    if (!thread.messages) return null;

    return thread.messages.map((message) => ({
      id: message.id,
      content: message.content,
      tool_calls: message.tool_calls,
      component: message.component,
      reasoning: message.reasoning,
      componentState: message.componentState,
    }));
  }, [thread.messages]);

  const generationStage = thread?.generationStage ?? "IDLE";

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 8; // 8px tolerance for rounding

    // If user scrolled up, disable autoscroll
    if (scrollTop < lastScrollTopRef.current) {
      setShouldAutoscroll(false);
    }
    // If user is at bottom, enable autoscroll
    else if (isAtBottom) {
      setShouldAutoscroll(true);
    }

    lastScrollTopRef.current = scrollTop;
  };

  // Auto-scroll to bottom when message content changes
  useEffect(() => {
    if (scrollContainerRef.current && messagesContent && shouldAutoscroll) {
      const scroll = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      };

      if (generationStage === "STREAMING_RESPONSE") {
        // During streaming, scroll immediately
        requestAnimationFrame(scroll);
      } else {
        // For other updates, use a short delay to batch rapid changes
        const timeoutId = setTimeout(scroll, 50);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messagesContent, generationStage, shouldAutoscroll]);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShouldAutoscroll(true);
    }
  }, []);

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto min-h-0",
          "[&::-webkit-scrollbar]:w-[6px]",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
          "dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
          "[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50",
          "[&::-webkit-scrollbar:horizontal]:h-[4px]",
          className,
        )}
        data-slot="scrollable-message-container"
        {...props}
      >
        {children}
      </div>
      {!shouldAutoscroll && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 py-2 px-3 rounded-lg bg-background border border-border shadow-md text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
          aria-label="Scroll to bottom"
        >
          <span className="flex items-center gap-1.5">
            <ChevronDown className="h-4 w-4" />
            New messages
          </span>
        </button>
      )}
    </div>
  );
});
ScrollableMessageContainer.displayName = "ScrollableMessageContainer";
