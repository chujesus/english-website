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
    profile: number; // usa enum Profile
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

    // contenido JSON
    grammar?: any;             // estructura de reglas
    reading?: any;             // texto + preguntas
    speaking?: any;            // vocabulario/pronunciación
    listening?: any;           // audios + respuestas
    writing?: any;             // ejercicios escritos

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
    score?: number;

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