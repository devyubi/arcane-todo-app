// 새로운 Task 생성 담당 로직

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/apis/taskApi";
import { TASK_LIST_QUERY_KEY } from "./useTaskListQuery";
import type { Task, TaskCreateInput } from "@/types/task";

type RollbackContext = {
  previousTaskList: Task[] | undefined;
};

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, TaskCreateInput, RollbackContext>({
    mutationFn: createTask,

    onMutate: async (newTaskInputData) => {
      await queryClient.cancelQueries({ queryKey: TASK_LIST_QUERY_KEY });

      const previousTaskList =
        queryClient.getQueryData<Task[]>(TASK_LIST_QUERY_KEY);

      const optimisticTaskData: Task = {
        id: Date.now(),
        title: newTaskInputData.title,
        status: "todo",
        dueDate: newTaskInputData.dueDate ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        description: newTaskInputData.description ?? "",
        priority: newTaskInputData.priority ?? "medium",
      };

      queryClient.setQueryData<Task[]>(
        TASK_LIST_QUERY_KEY,
        (previousTaskListData) => {
          if (!previousTaskListData) return [optimisticTaskData];
          return [optimisticTaskData, ...previousTaskListData];
        }
      );

      return { previousTaskList };
    },

    onError: (_errorObject, _requestData, rollbackContext) => {
      if (rollbackContext?.previousTaskList) {
        queryClient.setQueryData(
          TASK_LIST_QUERY_KEY,
          rollbackContext.previousTaskList
        );
      }
    },

    onSuccess: (createdTaskData) => {
      queryClient.setQueryData<Task[]>(
        TASK_LIST_QUERY_KEY,
        (previousTaskListData) => {
          if (!previousTaskListData) return [createdTaskData];
          return [
            createdTaskData,
            ...previousTaskListData.filter(
              (taskItem) => taskItem.id !== createdTaskData.id
            ),
          ];
        }
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_LIST_QUERY_KEY });
    },
  });
}
