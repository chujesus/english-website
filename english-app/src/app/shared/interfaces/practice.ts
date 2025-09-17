// Practice-related interfaces
export interface PracticeAttempt {
    id: number;
    user_id: number;
    topic_id: number;
    practice_type: 'listening' | 'speaking' | 'fill_in_blank';
    section_index: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_spent: number;
    completed_at: string;
    topic_title: string;
    percentage: number;
}

export interface PracticeSubmission {
    user_id: number;
    topic_id: number;
    practice_type: 'listening' | 'speaking' | 'fill_in_blank';
    section_index: number;
    total_questions: number;
    correct_answers: number;
    time_spent?: number;
    answers?: any[];
}

export interface TopicScore {
    average_score: number;
    total_practices: number;
    passed_practices: number;
    completion_rate: number;
}
