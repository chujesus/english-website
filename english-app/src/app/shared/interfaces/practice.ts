// Practice-related interfaces

// Payload sent when a student submits a practice attempt
export interface PracticeSubmission {
    user_id: number;
    topic_id: number;
    practice_type: 'grammar' | 'reading' | 'speaking' | 'listening' | 'writing';
    section_index: number;
    score: number;
    completed: boolean;
    answers?: any[];
    time_spent?: number;
}

export interface TopicScore {
    average_score: number;
    total_practices: number;
    passed_practices: number;
    completion_rate: number;
}

