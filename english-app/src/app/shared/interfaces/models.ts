// =============================
// User
// =============================
export interface IUser {
    id?: number;
    identification: string;
    name: string;
    first_name?: string;
    last_name?: string;
    password?: string;
    email: string;
    phone?: string;
    password_token?: string;
    state: number;
    profile: number;
    starting_module?: 'A1' | 'A2' | 'B1' | 'B2';
    url_image?: string;
    image_name?: string;
    token?: string;
    created_at?: Date;
    updated_at?: Date;
}

// =============================
// Course
// =============================
export interface ICourse {
    id?: number;
    level: 'A1' | 'A2' | 'B1' | 'B2';
    title: string;
    description?: string;
    progress_percent?: number;
    status?: 'not_started' | 'in_progress' | 'completed';
    lastAccessed?: string;

    created_at?: Date;
    updated_at?: Date;
}

// =============================
// Topic
// =============================
export interface ITopic {
    id?: number;
    course_id: number;
    title: string;
    objective?: string;
    examples?: string[];       // JSON → array
    keywords?: string[];       // JSON → array
    learning_outcome?: string;
    cefr_level: 'A1' | 'A2' | 'B1' | 'B2';
    skills_covered?: string[]; // JSON → array
    tags?: string[];           // JSON → array
    progress_percent?: number;
    status?: 'not_started' | 'in_progress' | 'completed';
    created_at?: Date;
    updated_at?: Date;
}

// =============================
// Lesson
// =============================
export interface ILesson {
    id?: number;
    topic_id: number;
    title: string;
    objective?: string;

    // flags
    is_grammar?: boolean;
    is_reading?: boolean;
    is_speaking?: boolean;
    is_listening?: boolean;
    is_writing?: boolean;

    // JSON content
    content?: any;             // general content
    grammar?: any;             // rules structure
    reading?: any;             // text + questions
    speaking?: any;            // vocabulary/pronunciation
    listening?: any;           // audios + answers
    writing?: any;             // writing exercises

    created_at?: Date;
    updated_at?: Date;
}

// =============================
// Student Progress
// =============================
export interface IStudentProgress {
    id?: number;
    user_id: number;
    course_id: number;
    topic_id: number;
    lesson_id: number;

    is_completed?: boolean;
    progress_percent?: number;
    last_accessed?: Date;

    created_at?: Date;
    updated_at?: Date;
}

// =============================
// Assessment
// =============================
export interface IAssessment {
    id?: number;
    user_id: number;
    student_progress_id: number;

    type: 'grammar' | 'reading' | 'speaking' | 'listening' | 'writing';
    practice_answered: any;   // JSON con respuestas
    score?: number;
    feedback?: string;

    created_at?: Date;
    updated_at?: Date;
}


// =============================
// Practice Interfaces
// =============================
export interface SpeechPracticeItem {
    english: string;
    definition: string;
    pronunciation: string;
}

export interface IListening {
    audio: string;
    options: string[];
    answer: string;
}

export interface IFillInBlank {
    prefix: string[];
    suffix: string;
    answer: string;
    selected: string;
    feedback: string;
}

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

// =============================
// Admin Content Management Interfaces
// =============================

// Interface for content upload/management
export interface IContentUpload {
    id?: number;
    title: string;
    description?: string;
    content_type: 'course' | 'topic' | 'lesson';
    file_path?: string;
    metadata?: any;
    created_at?: Date;
    updated_at?: Date;
}

// Interface for topic updates
export interface ITopicUpdate {
    id?: number;
    course_id: number;
    title: string;
    objective: string;
    examples?: any[];
    keywords?: string[];
    learning_outcome?: string;
    cefr_level?: string;
    skills_covered?: string[];
    tags?: string[];
}

// Interface for lesson uploads
export interface ILessonUpload {
    id?: number;
    topic_id: number;
    title: string;
    objective: string;
    is_grammar: boolean;
    is_reading: boolean;
    is_speaking: boolean;
    is_listening: boolean;
    is_writing: boolean;
    grammar?: any;
    reading?: any;
    speaking?: any;
    listening?: any;
    writing?: any;
    content_files?: File[];
    metadata?: any;
}

// Interface for content management operations
export interface IContentManagement {
    operation: 'create' | 'update' | 'delete' | 'upload';
    entity_type: 'course' | 'topic' | 'lesson';
    entity_id?: number;
    data?: any;
    files?: File[];
    success?: boolean;
    message?: string;
}
