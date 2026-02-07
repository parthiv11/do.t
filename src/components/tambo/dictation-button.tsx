import { Tooltip } from "@/components/tambo/suggestions-tooltip";
import { useTamboThreadInput, useTamboVoice } from "@tambo-ai/react";
import { Loader2Icon, Mic, Square } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Button for dictating speech into the message input.
 */
export default function DictationButton() {
  const {
    startRecording,
    stopRecording,
    isRecording,
    isTranscribing,
    transcript,
    transcriptionError,
  } = useTamboVoice();
  const { value, setValue } = useTamboThreadInput();
  const lastProcessedTranscriptRef = useRef<string>("");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleStartRecording = () => {
    lastProcessedTranscriptRef.current = "";
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  useEffect(() => {
    if (transcript && transcript !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = transcript;
      setValue(value + " " + transcript);
    }
  }, [transcript, value, setValue]);

  if (isTranscribing) {
    return (
      <div className={cn(
        "p-2 rounded-md",
        isDark ? "text-slate-400" : "text-gray-500"
      )}>
        <Loader2Icon className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <span className={cn(
        "text-sm",
        isDark ? "text-rose-400" : "text-rose-600"
      )}>{transcriptionError}</span>
      {isRecording ? (
        <Tooltip content="Stop">
          <button
            type="button"
            onClick={handleStopRecording}
            className={cn(
              "p-2 rounded-md cursor-pointer",
              isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"
            )}
          >
            <Square className="h-4 w-4 text-red-500 fill-current animate-pulse" />
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Dictate">
          <button
            type="button"
            onClick={handleStartRecording}
            className={cn(
              "p-2 rounded-md cursor-pointer",
              isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100 text-gray-700"
            )}
          >
            <Mic className="h-5 w-5" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
