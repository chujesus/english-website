// Content-related interfaces
export interface Course {
    id: number;
    level: string;
    title: string;
    description: string;
    total_topics: number;
    state: number;
    created_at: string;
    updated_at: string;
}

export interface Topic {
    id?: number;
    course_id?: number;
    topic_index?: number;
    title?: string;
    objective?: string;
    cefrLevel?: string;
    keywords?: string[];
    examples?: string[];
    learning_outcome?: string;
    skills_covered?: string[];
    tags?: string[];
    state?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Lesson {
    id: number;
    topic_id: number;
    lesson_index: number;
    content: any;
    state: number;
    created_at: string;
    updated_at: string;
    topic_title?: string;
    course_level?: string;
}

// Course Module interface for admin management
export interface CourseModule {
    id: number;
    title: string;
    level: string;
    description: string;
    topics: number;
    progress?: number;
    lastAccessed?: string;
    status: 'not_started' | 'in_progress' | 'completed';
    state?: number;
    created_at?: string;
    updated_at?: string;
}

// Lesson viewer interfaces

export interface ISpeaking {
    english: string;
    spanish: string;
    definition: string;
    example: string;
    pronunciation: string;
}

export interface Grammar {
    title: string;
    rule: string;
    examples: string[];
}

export interface ReadingQuestion {
    question: string;
    options: string[];
    answer: string;
}

export interface ReadingSection {
    title: string;
    text: string;
    questions: ReadingQuestion[];
}



export interface LessonSection {
    type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'practice';
    title: string;
    content: any;
}

