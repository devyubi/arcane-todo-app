"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Task } from "@/types/task";
import { useUpdateTaskMutation } from "../hooks/useUpdateTaskMutation";

interface DueDateEditorPopoverProps {
  task: Task;
}

export default function DueDateEditorPopover({
  task,
}: DueDateEditorPopoverProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateTask } = useUpdateTaskMutation();

  // 날짜 선택
  const handleSelectDate = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      updateTask({
        id: task.id,
        dueDate: format(date, "yyyy-MM-dd"),
      });

      setOpen(false);
    },
    [task.id, updateTask]
  );

  // 날짜 제거
  const handleRemoveDate = useCallback(() => {
    updateTask({
      id: task.id,
      dueDate: null,
    });

    setOpen(false);
  }, [task.id, updateTask]);

  // 마감일 Date 객체 메모
  const selectedDate = useMemo(() => {
    return task.dueDate ? new Date(task.dueDate) : undefined;
  }, [task.dueDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="
            h-8 px-2 text-sm font-medium 
            text-muted-foreground 
            hover:text-foreground
          "
        >
          {task.dueDate ? `마감일: ${task.dueDate}` : "마감일 없음"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-3 rounded-lg border bg-popover shadow-md w-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
        />

        <Button
          variant="ghost"
          className="w-full mt-2 text-sm"
          onClick={handleRemoveDate}
        >
          마감일 제거
        </Button>
      </PopoverContent>
    </Popover>
  );
}
