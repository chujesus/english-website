// Admin-related interfaces
export interface ContentUpload {
    courseId: number;
    topics: any[];
    lessons: any[];
}

export interface TopicUpdate {
    title: string;
    objective: string;
    keywords: string[];
    examples: string[];
    learning_outcome: string;
    skills_covered: string[];
    tags: string[];
}

export interface LessonUpload {
    lesson_index: number;
    content: any;
}

export interface ContentManagement {
    courses: any[];
    recent_uploads: any[];
}