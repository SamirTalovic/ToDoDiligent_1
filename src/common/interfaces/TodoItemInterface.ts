export interface TodoItem {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    appUserId: string; 
    isCompleted: Boolean;
    completedAt: Date | null;
}

export interface CreateTodoItem {
    title: string;
    description: string;
    createdAt: Date;
    appUserId: string; 
}
