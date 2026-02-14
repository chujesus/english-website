import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, AdminCourse, AdminTopic, AdminLesson } from '../../core/services/admin.service';
import { EditorConfigService } from '../../core/services/editor-config.service';
import { SharedModule } from '../../shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';


@Component({
    selector: 'app-manage-content',
    standalone: true,
    imports: [SharedModule, AngularEditorModule],
    templateUrl: './manage-content.component.html',
    styleUrl: './manage-content.component.scss'
})
export class ManageContentComponent implements OnInit {
    // Navigation state
    currentView: 'courses' | 'topics' | 'lessons' = 'courses';
    selectedCourse: AdminCourse | null = null;
    selectedTopic: AdminTopic | null = null;

    // Data arrays
    courses: AdminCourse[] = [];
    topics: AdminTopic[] = [];
    lessons: AdminLesson[] = [];

    // Loading states
    loading = false;
    error = '';

    // Modal states
    showCourseModal = false;
    showTopicModal = false;
    showLessonModal = false;
    isEditing = false;

    editorConfig: any;

    // Forms
    courseForm: FormGroup;
    topicForm: FormGroup;
    lessonForm: FormGroup;

    // JSON Editor state
    selectedJsonField: string = 'grammar';
    currentJsonContent: string = 'null';

    // Topic JSON Editor state
    selectedTopicJsonField: string = 'examples';
    currentTopicJsonContent: string = '[]';

    constructor(
        private adminService: AdminService,
        private fb: FormBuilder,
        private editorService: EditorConfigService
    ) {
        this.courseForm = this.createCourseForm();
        this.topicForm = this.createTopicForm();
        this.lessonForm = this.createLessonForm();
        this.editorConfig = this.editorService.editorConfig;
    }

    ngOnInit(): void {
        this.loadCourses();
    }

    // Navigation methods
    showCoursesView(): void {
        this.currentView = 'courses';
        this.selectedCourse = null;
        this.selectedTopic = null;
        this.loadCourses();
    }

    showTopicsView(course: AdminCourse): void {
        this.selectedCourse = course;
        this.selectedTopic = null;
        this.currentView = 'topics';
        this.loadTopics(course.id!);
    }

    showLessonsView(topic: AdminTopic): void {
        this.selectedTopic = topic;
        this.currentView = 'lessons';
        this.loadLessons(topic.id!);
    }

    // Data loading methods
    loadCourses(): void {
        this.loading = true;
        this.error = '';
        this.adminService.getAllCourses().subscribe({
            next: (response) => {
                this.courses = response.courses || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading courses:', error);
                this.error = 'Error loading courses';
                this.loading = false;
            }
        });
    }

    loadTopics(courseId: number): void {
        this.loading = true;
        this.error = '';
        this.adminService.getTopicsByCourse(courseId).subscribe({
            next: (response) => {
                this.topics = response.topics || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading topics:', error);
                this.error = 'Error loading topics';
                this.loading = false;
            }
        });
    }

    loadLessons(topicId: number): void {
        this.loading = true;
        this.error = '';
        this.adminService.getLessonsByTopic(topicId).subscribe({
            next: (response) => {
                this.lessons = response.lessons || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading lessons:', error);
                this.error = 'Error loading lessons';
                this.loading = false;
            }
        });
    }

    // Form creation methods
    createCourseForm(): FormGroup {
        return this.fb.group({
            id: [null],
            level: ['', Validators.required],
            title: ['', Validators.required],
            description: ['']
        });
    }

    createTopicForm(): FormGroup {
        return this.fb.group({
            id: [null],
            course_id: [null, Validators.required],
            title: ['', Validators.required],
            objective: ['', Validators.required],
            examples: ['[]'],
            keywords: ['[]'],
            learning_outcome: [''],
            cefr_level: [''],
            skills_covered: ['[]'],
            tags: ['[]']
        });
    }

    createLessonForm(): FormGroup {
        return this.fb.group({
            id: [null],
            topic_id: [null, Validators.required],
            title: ['', Validators.required],
            objective: ['', Validators.required],
            is_grammar: [false],
            is_reading: [false],
            is_speaking: [false],
            is_listening: [false],
            is_writing: [false],
            content: [''],
            grammar: ['null'],
            reading: ['null'],
            speaking: ['null'],
            listening: ['null'],
            writing: ['null']
        });
    }

    // Modal methods
    openCourseModal(course?: AdminCourse): void {
        this.isEditing = !!course;
        if (course) {
            this.courseForm.patchValue(course);
        } else {
            this.courseForm.reset();
        }
        this.showCourseModal = true;
    }

    openTopicModal(topic?: AdminTopic): void {
        this.isEditing = !!topic;
        if (topic) {
            this.topicForm.patchValue({
                ...topic,
                examples: JSON.stringify(topic.examples || [], null, 2),
                keywords: JSON.stringify(topic.keywords || [], null, 2),
                skills_covered: JSON.stringify(topic.skills_covered || [], null, 2),
                tags: JSON.stringify(topic.tags || [], null, 2)
            });
        } else {
            this.topicForm.reset();
            this.topicForm.patchValue({
                course_id: this.selectedCourse?.id,
                examples: '[]',
                keywords: '[]',
                skills_covered: '[]',
                tags: '[]'
            });
        }

        // Initialize Topic JSON editor
        this.selectedTopicJsonField = 'examples';
        this.currentTopicJsonContent = this.topicForm.get('examples')?.value || '[]';

        this.showTopicModal = true;
    }

    openLessonModal(lesson?: AdminLesson): void {
        this.isEditing = !!lesson;
        if (lesson) {
            this.lessonForm.patchValue({
                ...lesson,
                content: lesson.content || '',
                grammar: JSON.stringify(lesson.grammar || null, null, 2),
                reading: JSON.stringify(lesson.reading || null, null, 2),
                speaking: JSON.stringify(lesson.speaking || null, null, 2),
                listening: JSON.stringify(lesson.listening || null, null, 2),
                writing: JSON.stringify(lesson.writing || null, null, 2)
            });
        } else {
            this.lessonForm.reset();
            this.lessonForm.patchValue({
                topic_id: this.selectedTopic?.id,
                content: '',
                grammar: 'null',
                reading: 'null',
                speaking: 'null',
                listening: 'null',
                writing: 'null'
            });
        }

        // Initialize editor (start with content field)
        this.selectedJsonField = 'content';
        if (this.selectedJsonField !== 'content') {
            this.currentJsonContent = this.lessonForm.get(this.selectedJsonField)?.value || 'null';
        }

        this.showLessonModal = true;
    }

    closeModals(): void {
        this.showCourseModal = false;
        this.showTopicModal = false;
        this.showLessonModal = false;
        this.isEditing = false;
    }

    // JSON validation helper
    isValidJSON(jsonString: string): boolean {
        try {
            JSON.parse(jsonString);
            return true;
        } catch {
            return false;
        }
    }

    // Save methods
    saveCourse(): void {
        if (this.courseForm.invalid) return;

        const courseData = this.courseForm.value;
        const operation = this.isEditing
            ? this.adminService.updateCourse(courseData.id, courseData)
            : this.adminService.createCourse(courseData);

        operation.subscribe({
            next: (response) => {
                this.closeModals();
                this.loadCourses();
            },
            error: (error) => {
                console.error('Error saving course:', error);
                this.error = 'Error saving course';
            }
        });
    }

    saveTopic(): void {
        if (this.topicForm.invalid) return;

        const formData = this.topicForm.value;

        // Validate JSON fields
        const jsonFields = ['examples', 'keywords', 'skills_covered', 'tags'];
        for (const field of jsonFields) {
            if (!this.isValidJSON(formData[field])) {
                this.error = `Invalid JSON format in ${field}`;
                return;
            }
        }

        const topicData = {
            ...formData,
            examples: JSON.parse(formData.examples),
            keywords: JSON.parse(formData.keywords),
            skills_covered: JSON.parse(formData.skills_covered),
            tags: JSON.parse(formData.tags)
        };

        const operation = this.isEditing
            ? this.adminService.updateTopic(topicData.id, topicData)
            : this.adminService.createTopic(topicData);

        operation.subscribe({
            next: (response) => {
                this.closeModals();
                this.loadTopics(this.selectedCourse!.id!);
            },
            error: (error) => {
                console.error('Error saving topic:', error);
                this.error = 'Error saving topic';
            }
        });
    }

    saveLesson(): void {
        if (this.lessonForm.invalid) return;

        const formData = this.lessonForm.value;

        // Validate JSON fields (content is LONGTEXT, not JSON)
        const jsonFields = ['grammar', 'reading', 'speaking', 'listening', 'writing'];
        for (const field of jsonFields) {
            if (formData[field] !== 'null' && !this.isValidJSON(formData[field])) {
                this.error = `Invalid JSON format in ${field}`;
                return;
            }
        }

        const lessonData = {
            ...formData,
            content: formData.content || null,
            grammar: formData.grammar === 'null' ? null : JSON.parse(formData.grammar),
            reading: formData.reading === 'null' ? null : JSON.parse(formData.reading),
            speaking: formData.speaking === 'null' ? null : JSON.parse(formData.speaking),
            listening: formData.listening === 'null' ? null : JSON.parse(formData.listening),
            writing: formData.writing === 'null' ? null : JSON.parse(formData.writing)
        };

        const operation = this.isEditing
            ? this.adminService.updateLesson(lessonData.id, lessonData)
            : this.adminService.createLesson(lessonData);

        operation.subscribe({
            next: (response) => {
                this.closeModals();
                this.loadLessons(this.selectedTopic!.id!);
            },
            error: (error) => {
                console.error('Error saving lesson:', error);
                this.error = 'Error saving lesson';
            }
        });
    }

    // Delete methods
    deleteCourse(course: AdminCourse): void {
        if (confirm(`Are you sure you want to delete the course "${course.title}"?`)) {
            this.adminService.deleteCourse(course.id!).subscribe({
                next: () => {
                    this.loadCourses();
                },
                error: (error) => {
                    console.error('Error deleting course:', error);
                    this.error = 'Error deleting course';
                }
            });
        }
    }

    deleteTopic(topic: AdminTopic): void {
        if (confirm(`Are you sure you want to delete the topic "${topic.title}"?`)) {
            this.adminService.deleteTopic(topic.id!).subscribe({
                next: () => {
                    this.loadTopics(this.selectedCourse!.id!);
                },
                error: (error) => {
                    console.error('Error deleting topic:', error);
                    this.error = 'Error deleting topic';
                }
            });
        }
    }

    deleteLesson(lesson: AdminLesson): void {
        if (confirm(`Are you sure you want to delete the lesson "${lesson.title}"?`)) {
            this.adminService.deleteLesson(lesson.id!).subscribe({
                next: () => {
                    this.loadLessons(this.selectedTopic!.id!);
                },
                error: (error) => {
                    console.error('Error deleting lesson:', error);
                    this.error = 'Error deleting lesson';
                }
            });
        }
    }

    // JSON helper methods
    copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text);
    }

    formatJSON(jsonString: string): string {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
            return jsonString;
        }
    }

    // JSON Editor methods
    onJsonFieldChange(): void {
        // For content field, we don't use currentJsonContent (uses angular-editor directly)
        if (this.selectedJsonField === 'content') {
            return;
        }
        // Load the content of the selected field into the JSON editor
        const fieldValue = this.lessonForm.get(this.selectedJsonField)?.value || 'null';
        this.currentJsonContent = fieldValue;
    }

    updateLessonFormField(): void {
        // For content field, we don't use currentJsonContent (uses angular-editor directly)
        if (this.selectedJsonField === 'content') {
            return;
        }
        // Update the form field when the JSON editor content changes
        this.lessonForm.get(this.selectedJsonField)?.setValue(this.currentJsonContent);
    }

    getJsonFieldDisplayName(field: string): string {
        const names: { [key: string]: string } = {
            content: '📄 General Content',
            grammar: '📚 Grammar Content',
            reading: '📖 Reading Content',
            speaking: '🎤 Speaking Content',
            listening: '🎧 Listening Content',
            writing: '✍️ Writing Content'
        };
        return names[field] || field;
    }

    getJsonFieldPlaceholder(field: string): string {
        const placeholders: { [key: string]: string } = {
            grammar: `{
  "rules": [
    {
      "title": "Present Simple",
      "explanation": "Used for habits and facts",
      "examples": ["I work every day", "She likes coffee"]
    }
  ],
  "exercises": [
    {
      "question": "Choose the correct form",
      "options": ["work", "works"],
      "correct": 1
    }
  ]
}`,
            reading: `{
  "text": "The quick brown fox jumps over the lazy dog...",
  "questions": [
    {
      "question": "What animal jumps?",
      "options": ["dog", "fox", "cat"],
      "correct": 1
    }
  ],
  "vocabulary": [
    {"word": "quick", "meaning": "fast"}
  ]
}`,
            speaking: `{
  "prompts": [
    {
      "topic": "Personal Pronouns",
      "instruction": "Practice using I, you, he, she, it",
      "examples": ["I am a student", "You are my friend"]
    }
  ],
  "pronunciation": [
    {"word": "they", "phonetic": "/ðeɪ/"}
  ]
}`,
            listening: `{
  "audio": "audio_file.mp3",
  "transcript": "They are my friends from school.",
  "questions": [
    {
      "question": "Who are they?",
      "options": ["teachers", "friends", "family"],
      "correct": 1
    }
  ]
}`,
            writing: `{
  "prompt": "Write about your daily routine using personal pronouns",
  "guidelines": [
    "Use at least 5 different personal pronouns",
    "Write 5-8 sentences",
    "Include present simple verbs"
  ],
  "example": "I wake up at 7 AM. She makes breakfast..."
}`
        };
        return placeholders[field] || 'null or {}';
    }

    formatCurrentJsonField(): void {
        try {
            if (this.currentJsonContent && this.currentJsonContent.trim() !== 'null') {
                const parsed = JSON.parse(this.currentJsonContent);
                this.currentJsonContent = JSON.stringify(parsed, null, 2);
                this.updateLessonFormField();
            }
        } catch (error) {
            console.error('Invalid JSON format');
        }
    }

    copyCurrentJsonField(): void {
        if (this.currentJsonContent) {
            navigator.clipboard.writeText(this.currentJsonContent);
        }
    }

    clearCurrentJsonField(): void {
        this.currentJsonContent = 'null';
        this.updateLessonFormField();
    }

    loadJsonTemplate(type: 'empty' | 'basic' | 'advanced'): void {
        // Content field doesn't use JSON templates
        if (this.selectedJsonField === 'content') {
            return;
        }

        const templates: { [field: string]: { [type: string]: string } } = {
            grammar: {
                empty: 'null',
                basic: `{
  "rules": [],
  "exercises": []
}`,
                advanced: `{
  "rules": [
    {
      "title": "Rule Title",
      "explanation": "Detailed explanation",
      "examples": ["Example 1", "Example 2"],
      "structure": "Subject + Verb + Object"
    }
  ],
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correct": 0,
      "explanation": "Why this is correct"
    }
  ]
}`
            },
            reading: {
                empty: 'null',
                basic: `{
  "text": "",
  "questions": []
}`,
                advanced: `{
  "title": "Reading Title",
  "text": "Full reading passage text here...",
  "difficulty": "A1",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "What is the main idea?",
      "options": ["Option A", "Option B", "Option C"],
      "correct": 0
    }
  ],
  "vocabulary": [
    {"word": "example", "meaning": "definition", "phonetic": "/ɪɡˈzæmpəl/"}
  ]
}`
            },
            speaking: {
                empty: 'null',
                basic: `{
  "prompts": [],
  "activities": []
}`,
                advanced: `{
  "prompts": [
    {
      "topic": "Speaking Topic",
      "instruction": "Practice instructions",
      "examples": ["Example sentence"],
      "time_limit": "2 minutes"
    }
  ],
  "pronunciation": [
    {"word": "word", "phonetic": "/wɜːrd/", "audio": "word.mp3"}
  ]
}`
            },
            listening: {
                empty: 'null',
                basic: `{
  "audio": "",
  "questions": []
}`,
                advanced: `{
  "audio": "audio_file.mp3",
  "duration": "2:30",
  "transcript": "Full transcript here...",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "What did you hear?",
      "options": ["Option A", "Option B", "Option C"],
      "correct": 0,
      "time_mark": "0:45"
    }
  ]
}`
            },
            writing: {
                empty: 'null',
                basic: `{
  "prompt": "",
  "guidelines": []
}`,
                advanced: `{
  "prompt": "Writing task description",
  "guidelines": [
    "Use specific grammar structures",
    "Include required vocabulary",
    "Write minimum X words"
  ],
  "rubric": {
    "grammar": "Grammar accuracy",
    "vocabulary": "Vocabulary usage",
    "organization": "Text organization"
  },
  "example": "Sample response example..."
}`
            }
        };

        const template = templates[this.selectedJsonField]?.[type] || 'null';
        this.currentJsonContent = template;
        this.updateLessonFormField();
    }

    getJsonValidationClass(): string {
        if (!this.currentJsonContent || this.currentJsonContent.trim() === 'null') {
            return 'bg-secondary';
        }

        try {
            JSON.parse(this.currentJsonContent);
            return 'bg-success';
        } catch {
            return 'bg-danger';
        }
    }

    getJsonValidationIcon(): string {
        if (!this.currentJsonContent || this.currentJsonContent.trim() === 'null') {
            return 'fa-minus';
        }

        try {
            JSON.parse(this.currentJsonContent);
            return 'fa-check';
        } catch {
            return 'fa-times';
        }
    }

    getJsonValidationMessage(): string {
        if (!this.currentJsonContent || this.currentJsonContent.trim() === 'null') {
            return 'Empty Content';
        }

        try {
            JSON.parse(this.currentJsonContent);
            return 'Valid JSON';
        } catch {
            return 'Invalid JSON';
        }
    }

    getJsonLineCount(): number {
        return this.currentJsonContent ? this.currentJsonContent.split('\n').length : 0;
    }

    // Topic JSON Editor methods
    onTopicJsonFieldChange(): void {
        // Load the content of the selected field into the editor
        const fieldValue = this.topicForm.get(this.selectedTopicJsonField)?.value || '[]';
        this.currentTopicJsonContent = fieldValue;
    }

    updateTopicFormField(): void {
        // Update the form field when the editor content changes
        this.topicForm.get(this.selectedTopicJsonField)?.setValue(this.currentTopicJsonContent);
    }

    getTopicJsonFieldDisplayName(field: string): string {
        const names: { [key: string]: string } = {
            examples: '📝 Examples',
            keywords: '🔑 Keywords',
            skills_covered: '🎯 Skills Covered',
            tags: '🏷️ Tags'
        };
        return names[field] || field;
    }

    getTopicJsonFieldPlaceholder(field: string): string {
        const placeholders: { [key: string]: string } = {
            examples: `[
  "Hello, my name is Sarah.",
  "Nice to meet you!",
  "How are you?",
  "I'm fine, thank you."
]`,
            keywords: `[
  "greetings",
  "introductions", 
  "personal information",
  "formal language",
  "polite expressions"
]`,
            skills_covered: `[
  "speaking",
  "listening",
  "reading",
  "pronunciation",
  "vocabulary"
]`,
            tags: `[
  "beginner",
  "A1",
  "conversation",
  "social interaction",
  "basic communication"
]`
        };
        return placeholders[field] || '[]';
    }

    formatCurrentTopicJsonField(): void {
        try {
            if (this.currentTopicJsonContent && this.currentTopicJsonContent.trim() !== '[]') {
                const parsed = JSON.parse(this.currentTopicJsonContent);
                this.currentTopicJsonContent = JSON.stringify(parsed, null, 2);
                this.updateTopicFormField();
            }
        } catch (error) {
            console.error('Invalid JSON format');
        }
    }

    copyCurrentTopicJsonField(): void {
        if (this.currentTopicJsonContent) {
            navigator.clipboard.writeText(this.currentTopicJsonContent);
        }
    }

    clearCurrentTopicJsonField(): void {
        this.currentTopicJsonContent = '[]';
        this.updateTopicFormField();
    }

    loadTopicJsonTemplate(type: 'empty' | 'basic' | 'advanced'): void {
        const templates: { [field: string]: { [type: string]: string } } = {
            examples: {
                empty: '[]',
                basic: `[
  "Example 1",
  "Example 2",
  "Example 3"
]`,
                advanced: `[
  "Hello, my name is Sarah. I'm 25 years old.",
  "Nice to meet you! How are you today?",
  "I'm from Costa Rica. Where are you from?",
  "Thank you very much for your help.",
  "Have a great day! See you soon."
]`
            },
            keywords: {
                empty: '[]',
                basic: `[
  "keyword1",
  "keyword2",
  "keyword3"
]`,
                advanced: `[
  "greetings",
  "introductions",
  "personal information",
  "nationality",
  "age",
  "formal language",
  "polite expressions",
  "farewells"
]`
            },
            skills_covered: {
                empty: '[]',
                basic: `[
  "speaking",
  "listening"
]`,
                advanced: `[
  "speaking fluency",
  "listening comprehension",
  "reading comprehension",
  "pronunciation accuracy",
  "vocabulary usage",
  "grammar application",
  "cultural awareness"
]`
            },
            tags: {
                empty: '[]',
                basic: `[
  "beginner",
  "basic"
]`,
                advanced: `[
  "beginner",
  "A1",
  "conversation",
  "social interaction",
  "basic communication",
  "everyday situations",
  "interpersonal skills"
]`
            }
        };

        const template = templates[this.selectedTopicJsonField]?.[type] || '[]';
        this.currentTopicJsonContent = template;
        this.updateTopicFormField();
    }

    getTopicJsonValidationClass(): string {
        if (!this.currentTopicJsonContent || this.currentTopicJsonContent.trim() === '[]') {
            return 'bg-secondary';
        }

        try {
            const parsed = JSON.parse(this.currentTopicJsonContent);
            return Array.isArray(parsed) ? 'bg-success' : 'bg-warning';
        } catch {
            return 'bg-danger';
        }
    }

    getTopicJsonValidationIcon(): string {
        if (!this.currentTopicJsonContent || this.currentTopicJsonContent.trim() === '[]') {
            return 'fa-minus';
        }

        try {
            const parsed = JSON.parse(this.currentTopicJsonContent);
            return Array.isArray(parsed) ? 'fa-check' : 'fa-exclamation';
        } catch {
            return 'fa-times';
        }
    }

    getTopicJsonValidationMessage(): string {
        if (!this.currentTopicJsonContent || this.currentTopicJsonContent.trim() === '[]') {
            return 'Empty Array';
        }

        try {
            const parsed = JSON.parse(this.currentTopicJsonContent);
            return Array.isArray(parsed) ? 'Valid JSON Array' : 'Valid JSON (Not Array)';
        } catch {
            return 'Invalid JSON';
        }
    }

    getTopicJsonLineCount(): number {
        return this.currentTopicJsonContent ? this.currentTopicJsonContent.split('\n').length : 0;
    }

    // Dynamic navigation helper methods
    getCurrentIcon(): string {
        switch (this.currentView) {
            case 'courses': return 'fas fa-graduation-cap';
            case 'topics': return 'fas fa-book';
            case 'lessons': return 'fas fa-file-alt';
            default: return 'fas fa-graduation-cap';
        }
    }

    getCurrentTitle(): string {
        switch (this.currentView) {
            case 'courses': return 'Course Management';
            case 'topics': return `Topics for ${this.selectedCourse?.title || 'Course'}`;
            case 'lessons': return `Lessons for ${this.selectedTopic?.title || 'Topic'}`;
            default: return 'Content Management';
        }
    }

    getCurrentCount(): number {
        switch (this.currentView) {
            case 'courses': return this.courses.length;
            case 'topics': return this.topics.length;
            case 'lessons': return this.lessons.length;
            default: return 0;
        }
    }

    getCurrentDescription(): string {
        switch (this.currentView) {
            case 'courses': return 'Manage and organize your course catalog. Create, edit, and structure your learning content.';
            case 'topics': return `Organize topics within ${this.selectedCourse?.title || 'this course'}. Each topic contains multiple lessons.`;
            case 'lessons': return `Manage individual lessons for ${this.selectedTopic?.title || 'this topic'}. Configure content and learning materials.`;
            default: return 'Comprehensive content management for your learning platform.';
        }
    }
}