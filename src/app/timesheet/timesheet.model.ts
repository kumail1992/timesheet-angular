export interface TaskTypeList {
  id: string;
  createdAt: string;
  name: string;
}

export interface LogDTO {
  taskId: number;
  start: string;
  end: string;
  taskName: string;
  task: string;
  id: string;
}

export type TaskListParam = Partial<TaskTypeList>;
export type NewTask = Partial<LogDTO>;
