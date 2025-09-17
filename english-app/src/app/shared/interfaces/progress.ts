// Progress-related interfaces
export interface StudentProgress {
    id: number;
    user_id: number;
    course_id: number;
    topic_id: number;
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage: number;
    started_at: string | null;
    completed_at: string | null;
    last_accessed: string;
    // Fields from JOIN with topics and courses tables
    topic_title?: string;
    course_title?: string;
    course_level?: string;
}

export interface TopicProgress {
    progress: StudentProgress | null;
    practices: any[];
    total_practices: number;
}

export interface DashboardData {
    course_id: number;
    level: string;
    course_title: string;
    total_topics: number;
    topics_started: number;
    topics_completed: number;
    progress_percentage: number;
    last_activity: string;
}
