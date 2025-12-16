export enum DayOfWeek {
  Sunday = 'الأحد',
  Monday = 'الاثنين',
  Tuesday = 'الثلاثاء',
  Wednesday = 'الأربعاء',
  Thursday = 'الخميس',
  Friday = 'الجمعة',
  Saturday = 'السبت',
}

export interface Course {
  id: string;
  name: string;
  instructor?: string;
  location?: string;
  day: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  courseId?: string; // Links to a course
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AISuggestion {
  taskTitle: string;
  steps: string[];
  estimatedTime: string;
}