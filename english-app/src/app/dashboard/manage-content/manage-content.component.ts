import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, AdminCourse, AdminTopic, AdminLesson } from '../../core/services/admin.service';
import { AlertService } from '../../core/services/alert.service';
import { EditorConfigService } from '../../core/services/editor-config.service';
import { SettingService } from '../../core/services/setting.service';
import { ISetting } from '../../shared/interfaces/models';
import { SharedModule } from '../../shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SweetAlertResult } from 'sweetalert2';


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
    showPromptInfoModal = false;
    showTopicPromptModal = false;
    isEditing = false;

    editorConfig: any;

    // Forms
    courseForm: FormGroup;
    topicForm: FormGroup;
    lessonForm: FormGroup;

    // JSON Editor state
    selectedJsonField: string = 'content';
    currentJsonContent: string = 'null';

    // Prompt modal state
    topicPromptContent: string = '';
    topicPromptSetting: ISetting | null = null;
    topicPromptSaving: boolean = false;
    lessonPromptContent: string = '';
    lessonPromptSetting: ISetting | null = null;
    lessonPromptSaving: boolean = false;

    // Topic JSON Editor state
    selectedTopicJsonField: string = 'examples';
    currentTopicJsonContent: string = '[]';

    constructor(
        private adminService: AdminService,
        private alertService: AlertService,
        private fb: FormBuilder,
        private editorService: EditorConfigService,
        private settingService: SettingService
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
                examples: '[]',
                keywords: '[]',
                skills_covered: '[]',
                tags: '[]'
            });
            this.currentTopicJsonContent = JSON.stringify({
                examples: topic.examples || [],
                keywords: topic.keywords || [],
                skills_covered: topic.skills_covered || [],
                tags: topic.tags || []
            }, null, 2);
        } else {
            this.topicForm.reset();
            this.topicForm.patchValue({
                course_id: this.selectedCourse?.id,
                examples: '[]',
                keywords: '[]',
                skills_covered: '[]',
                tags: '[]'
            });
            this.currentTopicJsonContent = this.getTopicMetadataTemplate();
        }

        this.showTopicModal = true;
    }

    openLessonModal(lesson?: AdminLesson): void {
        this.isEditing = !!lesson;
        if (lesson) {
            this.lessonForm.patchValue({
                ...lesson,
                content: lesson.content || '',
                grammar: 'null',
                reading: 'null',
                speaking: 'null',
                listening: 'null',
                writing: 'null'
            });
            // Build combined skills JSON from existing lesson data
            const skillsData: any = {};
            if (lesson.grammar) skillsData.grammar = lesson.grammar;
            if (lesson.reading) skillsData.reading = lesson.reading;
            if (lesson.speaking) skillsData.speaking = lesson.speaking;
            if (lesson.listening) skillsData.listening = lesson.listening;
            if (lesson.writing) skillsData.writing = lesson.writing;
            const hasSkills = Object.keys(skillsData).length > 0;
            this.currentJsonContent = hasSkills
                ? JSON.stringify(skillsData, null, 2)
                : this.getSkillsTemplate();
            this.selectedJsonField = hasSkills ? 'skills' : 'content';
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
            this.currentJsonContent = this.getSkillsTemplate();
            this.selectedJsonField = 'content';
        }

        this.showLessonModal = true;
    }

    closeModals(): void {
        this.showCourseModal = false;
        this.showTopicModal = false;
        this.showLessonModal = false;
        this.isEditing = false;
    }

    openPromptInfoModal(): void {
        this.lessonPromptContent = this.textToHtml(this.getDefaultLessonPrompt());
        this.lessonPromptSetting = null;
        this.settingService.getSettingByName('Lesson Prompt').subscribe({
            next: (response: any) => {
                if (response.ok && response.data && response.data.value) {
                    this.lessonPromptSetting = response.data;
                    this.lessonPromptContent = response.data.value;
                } else if (response.ok && response.data) {
                    this.lessonPromptSetting = response.data;
                }
            },
            error: () => { /* setting not found, use default */ }
        });
        this.showPromptInfoModal = true;
    }

    closePromptInfoModal(): void {
        this.showPromptInfoModal = false;
    }

    saveLessonPrompt(): void {
        this.lessonPromptSaving = true;
        const payload: ISetting = { name: 'Lesson Prompt', value: this.lessonPromptContent, type: 'prompt' };
        if (this.lessonPromptSetting?.id) {
            this.settingService.updateSetting(this.lessonPromptSetting.id, payload).subscribe({
                next: (res: any) => {
                    this.lessonPromptSetting = res.data || { ...this.lessonPromptSetting, value: this.lessonPromptContent };
                    this.lessonPromptSaving = false;
                    this.alertService.showSuccessToast('Lesson Prompt saved successfully');
                    this.closePromptInfoModal();
                },
                error: () => {
                    this.lessonPromptSaving = false;
                    this.alertService.showErrorToast('Error saving Lesson Prompt');
                }
            });
        } else {
            this.settingService.createSetting(payload).subscribe({
                next: (res: any) => {
                    this.lessonPromptSetting = res.data;
                    this.lessonPromptSaving = false;
                    this.alertService.showSuccessToast('Lesson Prompt saved successfully');
                    this.closePromptInfoModal();
                },
                error: () => {
                    this.lessonPromptSaving = false;
                    this.alertService.showErrorToast('Error saving Lesson Prompt');
                }
            });
        }
    }

    restoreLessonDefaultPrompt(): void {
        this.alertService.showWarningAlert(
            'Restore Default Prompt',
            'The custom Lesson Prompt will be deleted and the system default will be restored. This action cannot be undone.'
        ).then((result: SweetAlertResult) => {
            if (!result.isConfirmed) return;
            this.lessonPromptContent = this.textToHtml(this.getDefaultLessonPrompt());
            if (this.lessonPromptSetting?.id) {
                const payload: ISetting = { name: 'Lesson Prompt', value: '', type: 'prompt' };
                this.settingService.updateSetting(this.lessonPromptSetting.id, payload).subscribe({
                    next: (res: any) => {
                        this.lessonPromptSetting = res.data || { ...this.lessonPromptSetting, value: '' };
                        this.alertService.showSuccessToast('Default Lesson Prompt restored');
                        this.closePromptInfoModal();
                    },
                    error: () => { this.alertService.showErrorToast('Error restoring default prompt'); }
                });
            } else {
                this.alertService.showSuccessToast('Default Lesson Prompt restored');
                this.closePromptInfoModal();
            }
        });
    }

    openTopicPromptModal(): void {
        this.topicPromptContent = this.textToHtml(this.getDefaultTopicPrompt());
        this.topicPromptSetting = null;
        this.settingService.getSettingByName('Topic Prompt').subscribe({
            next: (response: any) => {
                if (response.ok && response.data && response.data.value) {
                    this.topicPromptSetting = response.data;
                    this.topicPromptContent = response.data.value;
                } else if (response.ok && response.data) {
                    this.topicPromptSetting = response.data;
                }
            },
            error: () => { /* setting not found, use default */ }
        });
        this.showTopicPromptModal = true;
    }

    closeTopicPromptModal(): void {
        this.showTopicPromptModal = false;
    }

    saveTopicPrompt(): void {
        this.topicPromptSaving = true;
        const payload: ISetting = { name: 'Topic Prompt', value: this.topicPromptContent, type: 'prompt' };
        if (this.topicPromptSetting?.id) {
            this.settingService.updateSetting(this.topicPromptSetting.id, payload).subscribe({
                next: (res: any) => {
                    this.topicPromptSetting = res.data || { ...this.topicPromptSetting, value: this.topicPromptContent };
                    this.topicPromptSaving = false;
                    this.alertService.showSuccessToast('Topic Prompt saved successfully');
                    this.closeTopicPromptModal();
                },
                error: () => {
                    this.topicPromptSaving = false;
                    this.alertService.showErrorToast('Error saving Topic Prompt');
                }
            });
        } else {
            this.settingService.createSetting(payload).subscribe({
                next: (res: any) => {
                    this.topicPromptSetting = res.data;
                    this.topicPromptSaving = false;
                    this.alertService.showSuccessToast('Topic Prompt saved successfully');
                    this.closeTopicPromptModal();
                },
                error: () => {
                    this.topicPromptSaving = false;
                    this.alertService.showErrorToast('Error saving Topic Prompt');
                }
            });
        }
    }

    restoreTopicDefaultPrompt(): void {
        this.alertService.showWarningAlert(
            'Restore Default Prompt',
            'The custom Topic Prompt will be deleted and the system default will be restored. This action cannot be undone.'
        ).then((result: SweetAlertResult) => {
            if (!result.isConfirmed) return;
            this.topicPromptContent = this.textToHtml(this.getDefaultTopicPrompt());
            if (this.topicPromptSetting?.id) {
                const payload: ISetting = { name: 'Topic Prompt', value: '', type: 'prompt' };
                this.settingService.updateSetting(this.topicPromptSetting.id, payload).subscribe({
                    next: (res: any) => {
                        this.topicPromptSetting = res.data || { ...this.topicPromptSetting, value: '' };
                        this.alertService.showSuccessToast('Default Topic Prompt restored');
                        this.closeTopicPromptModal();
                    },
                    error: () => { this.alertService.showErrorToast('Error restoring default prompt'); }
                });
            } else {
                this.alertService.showSuccessToast('Default Topic Prompt restored');
                this.closeTopicPromptModal();
            }
        });
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

        if (!this.isValidJSON(this.currentTopicJsonContent)) {
            this.alertService.showErrorToast('Invalid JSON format in Topic Metadata');
            return;
        }

        const metadata = JSON.parse(this.currentTopicJsonContent);

        const topicData = {
            ...formData,
            examples: Array.isArray(metadata.examples) ? metadata.examples : [],
            keywords: Array.isArray(metadata.keywords) ? metadata.keywords : [],
            skills_covered: Array.isArray(metadata.skills_covered) ? metadata.skills_covered : [],
            tags: Array.isArray(metadata.tags) ? metadata.tags : []
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

        if (this.selectedJsonField === 'skills') {
            // Validate the combined skills JSON
            if (!this.currentJsonContent || this.currentJsonContent.trim() === 'null' || !this.isValidJSON(this.currentJsonContent)) {
                this.alertService.showErrorToast('Invalid JSON format in Skills Practice');
                return;
            }
            const skillsData = JSON.parse(this.currentJsonContent);
            const skillMap: { check: string; key: string }[] = [
                { check: 'is_grammar', key: 'grammar' },
                { check: 'is_reading', key: 'reading' },
                { check: 'is_speaking', key: 'speaking' },
                { check: 'is_listening', key: 'listening' },
                { check: 'is_writing', key: 'writing' }
            ];
            for (const { check, key } of skillMap) {
                if (formData[check]) {
                    if (!skillsData[key]) {
                        this.alertService.showWarningToast(`"${key}" is checked in Skills Covered but missing in the Skills Practice JSON`);
                        return;
                    }
                    formData[key] = JSON.stringify(skillsData[key]);
                } else {
                    formData[key] = 'null';
                }
            }
            formData.content = null;
        } else {
            // General Content mode — clear all skill fields
            formData.grammar = 'null';
            formData.reading = 'null';
            formData.speaking = 'null';
            formData.listening = 'null';
            formData.writing = 'null';
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
        this.alertService.showDeleteAlert('Delete Course', `Are you sure you want to delete the course "${course.title}"?`).then((result: SweetAlertResult) => {
            if (result.isConfirmed) {
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
        });
    }

    deleteTopic(topic: AdminTopic): void {
        this.alertService.showDeleteAlert('Delete Topic', `Are you sure you want to delete the topic "${topic.title}"?`).then((result: SweetAlertResult) => {
            if (result.isConfirmed) {
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
        });
    }

    deleteLesson(lesson: AdminLesson): void {
        this.alertService.showDeleteAlert('Delete Lesson', `Are you sure you want to delete the lesson "${lesson.title}"?`).then((result: SweetAlertResult) => {
            if (result.isConfirmed) {
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
        });
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
        // 'content' is handled by angular-editor via formControlName
        // 'skills' JSON is stored directly in currentJsonContent (initialized in openLessonModal)
    }

    updateLessonFormField(): void {
        // 'content' is handled by angular-editor via formControlName
        // 'skills' JSON is stored directly in currentJsonContent; form fields are set in saveLesson
    }

    getJsonFieldDisplayName(field: string): string {
        const names: { [key: string]: string } = {
            content: '📄 General Content',
            skills: '🎯 Skills Practice'
        };
        return names[field] || field;
    }

    getJsonFieldPlaceholder(field: string): string {
        if (field === 'skills') {
            return this.getSkillsTemplate();
        }
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

        // Handle Skills Practice combined JSON
        if (this.selectedJsonField === 'skills') {
            if (type === 'empty') {
                this.currentJsonContent = 'null';
            } else if (type === 'basic') {
                this.currentJsonContent = this.getSkillsTemplate();
            } else {
                this.currentJsonContent = JSON.stringify({
                    grammar: [{ title: 'Present Simple', rule: 'Used for facts and habits', examples: ['I work every day', 'She likes coffee'] }],
                    reading: { title: 'A Day at the Park', text: 'Maria goes to the park every morning...', questions: [{ question: 'Where does Maria go every morning?', options: ['To the gym', 'To the park', 'To work'], answer: 'To the park' }] },
                    speaking: [{ english: 'Nice to meet you!', example: 'A: Hi! Nice to meet you! B: Nice to meet you too!', pronunciation: '/naɪs tə miːt juː/' }],
                    listening: [{ audio: 'lesson_audio.mp3', options: ['He is a teacher', 'He is a student', 'He is a doctor'], answer: 'He is a teacher' }],
                    writing: [{ prefix: ['I', 'go'], suffix: 'every day.', answer: 'I go to school every day.' }]
                }, null, 2);
            }
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

    getSkillsTemplate(): string {
        return JSON.stringify({
            grammar: [{ title: '', rule: '', examples: [] }],
            reading: { title: '', text: '', questions: [{ question: '', options: [], answer: '' }] },
            speaking: [{ english: '', example: '', pronunciation: '' }],
            listening: [{ audio: '', options: [], answer: '' }],
            writing: [{ prefix: [], suffix: '', answer: '' }]
        }, null, 2);
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
    onTopicJsonFieldChange(): void { }

    updateTopicFormField(): void { }

    getTopicJsonFieldDisplayName(field: string): string {
        return 'Topic Metadata';
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
            if (this.currentTopicJsonContent) {
                const parsed = JSON.parse(this.currentTopicJsonContent);
                this.currentTopicJsonContent = JSON.stringify(parsed, null, 2);
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
        this.currentTopicJsonContent = this.getTopicMetadataTemplate();
    }

    loadTopicJsonTemplate(type: 'empty' | 'basic' | 'advanced'): void {
        if (type === 'empty') {
            this.currentTopicJsonContent = 'null';
        } else if (type === 'basic') {
            this.currentTopicJsonContent = this.getTopicMetadataTemplate();
        } else {
            this.currentTopicJsonContent = JSON.stringify({
                examples: ['Example sentence 1', 'Example sentence 2', 'Example sentence 3'],
                keywords: ['keyword1', 'keyword2', 'keyword3', 'keyword4'],
                skills_covered: ['Grammar', 'Reading', 'Speaking', 'Listening', 'Writing'],
                tags: ['beginner', 'A1', 'conversation', 'communication']
            }, null, 2);
        }
    }

    getTopicMetadataTemplate(): string {
        return JSON.stringify({
            examples: [],
            keywords: [],
            skills_covered: [],
            tags: []
        }, null, 2);
    }

    getTopicJsonValidationClass(): string {
        if (!this.currentTopicJsonContent) return 'bg-secondary';
        try {
            JSON.parse(this.currentTopicJsonContent);
            return 'bg-success';
        } catch {
            return 'bg-danger';
        }
    }

    getTopicJsonValidationIcon(): string {
        if (!this.currentTopicJsonContent) return 'fa-minus';
        try {
            JSON.parse(this.currentTopicJsonContent);
            return 'fa-check';
        } catch {
            return 'fa-times';
        }
    }

    getTopicJsonValidationMessage(): string {
        if (!this.currentTopicJsonContent) return 'Empty';
        try {
            JSON.parse(this.currentTopicJsonContent);
            return 'Valid JSON';
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

    private textToHtml(text: string): string {
        return text
            .split('\n')
            .map(line => line.trim() === '' ? '<p></p>' : `<p>${line}</p>`)
            .join('');
    }

    getDefaultTopicPrompt(): string {
        return `You are an expert English curriculum designer specialized in:

• CEFR framework (A1–C2)
• Costa Rica Ministry of Education (MEP)
• communicative language teaching
• secondary education

Your task is to generate the structure of an English learning topic for an educational platform.

-------------------------------------

IMPORTANT

Do NOT generate lesson content.

Only generate:

• topic metadata
• topic JSON fields
• lesson titles and objectives

-------------------------------------

INPUT

Topic Title: {TOPIC}

CEFR Level: {LEVEL}

Number of Lessons: {LESSON_COUNT}

-------------------------------------

TASK

Generate the topic structure aligned with:

• CEFR descriptors
• Costa Rica MEP communicative approach
• progressive pedagogical structure

-------------------------------------

TOPIC INFORMATION

Title:
Level:
Objective:
Learning Outcome:

-------------------------------------

TOPIC JSON FIELDS

{
  "examples": [
    "Example sentence",
    "Example sentence"
  ],
  "keywords": [
    "word",
    "word",
    "word"
  ],
  "skillsCovered": [
    "Grammar",
    "Reading",
    "Speaking",
    "Listening",
    "Writing"
  ],
  "tags": [
    "daily-life",
    "communication",
    "grammar"
  ]
}

-------------------------------------

LESSONS

Generate exactly {LESSON_COUNT} lessons.

Each lesson must include:

Lesson Number
Lesson Title
Objective

Lessons must follow a logical progression and be aligned with the topic and CEFR level.

-------------------------------------

ADDITIONAL REQUIREMENT

After EACH lesson, generate an INPUT block with this exact structure:

INPUT

Topic: {TOPIC}

Lesson Title: {LESSON_TITLE}

CEFR Level: {LEVEL}

Objective: {OBJECTIVE}

Replace placeholders dynamically with the lesson data.

-------------------------------------

FORMAT

Lesson 1
Title:
Objective:

INPUT
Topic: {TOPIC}
Lesson Title: {LESSON_TITLE}
CEFR Level: {LEVEL}
Objective: {OBJECTIVE}

Lesson 2
Title:
Objective:

INPUT
Topic: {TOPIC}
Lesson Title: {LESSON_TITLE}
CEFR Level: {LEVEL}
Objective: {OBJECTIVE}

Continue until Lesson {LESSON_COUNT}.

-------------------------------------

LEVEL ADAPTATION

A1 → Basic vocabulary, introductions, simple sentences.
A2 → Daily communication, routines, descriptions.
B1 → Experiences, narratives, opinions.
B2 → Arguments, explanations, discussions.
C1 → Academic and analytical communication.
C2 → Advanced near-native discourse.`;
    }

    getDefaultLessonPrompt(): string {
        return `You are an expert English curriculum designer specialized in:

• CEFR framework
• Technical Education Study Programs of the Ministry of Public Education of Costa Rica.
• communicative language teaching
• secondary education pedagogy

You are generating lesson content for an English Learning Platform.

The result will be copied directly into a Rich Text Editor (Angular Editor).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CORE PEDAGOGICAL RULE (VERY IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL content MUST be strictly aligned with the OBJECTIVE.

• The Objective is the CENTRAL axis of the lesson
• Every section must directly support achieving the Objective
• Do NOT generate generic explanations unrelated to the Objective
• Examples, explanations, and practice MUST reflect the Objective
• If something does not help achieve the Objective → DO NOT include it

The lesson must feel like a guided path toward mastering the Objective.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 FORMAT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• DO NOT use HTML tags
• Use spacing, bullet points, and icons
• The lesson must look clean and structured
• Use icons to separate sections
• Do NOT display CEFR level inside the lesson sections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 VISUAL STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use these exact section headers:

🔹 Lesson Introduction
📘 Explanation
📊 Structure
📌 Examples
⚠ Common Mistakes
💡 Learning Tip
🧠 Practice
🚀 Challenge
🌎 Cultural Note

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Topic: {TOPIC}
Lesson Title: {LESSON_TITLE}
CEFR Level: {LEVEL}
Objective: {OBJECTIVE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate a COMPLETE LESSON based on the input.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 LESSON METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Include:

Lesson Title
Objective
Skills Covered

Skills Covered must include:

Grammar
Reading
Speaking
Listening
Writing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📘 GENERAL CONTENT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The lesson must be:

• highly detailed
• pedagogically progressive
• aligned with CEFR
• aligned with Costa Rica MEP
• communicative and practical

The explanation must include:

• conceptual explanation
• grammatical explanation
• communicative usage
• real-life situations
• contextual examples
• sentence structure patterns
• variations
• common mistakes
• guided examples

⚠ IMPORTANT:
ALL explanations MUST directly help achieve the Objective.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 GENERAL CONTENT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 Lesson Introduction
Explain what the student will learn and HOW it connects to the Objective.
Mention real-life situations where this Objective is useful.

📘 Explanation
Explain the concept in depth, ALWAYS linking it to the Objective.
Show how it works in real communication.
Use multiple contextual examples connected to the Objective.

📊 Structure
Show grammar patterns used to achieve the Objective.
Explain each component clearly.

📌 Examples
Provide real-life examples aligned with the Objective.

⚠ Common Mistakes
Include errors directly related to the Objective.

💡 Learning Tip
Give strategies to help achieve the Objective faster.

🧠 Practice
Exercises must reinforce the Objective step by step.

🚀 Challenge
Students produce language that demonstrates the Objective.

🌎 Cultural Note
Explain real-life use of this structure in communication.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT (UPDATED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return in this exact order:

1️⃣ LESSON METADATA
2️⃣ GENERAL CONTENT
3️⃣ ALL PRACTICE CONTENT IN ONE SINGLE JSON OBJECT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 JSON OUTPUT STRUCTURE (UPDATED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONE JSON object with this structure:

{
  "grammar": [
    {
      "title": "",
      "rule": "",
      "examples": []
    }
  ],
  "reading": {
    "title": "",
    "text": "",
    "questions": [
      {
        "question": "",
        "options": [],
        "answer": ""
      }
    ]
  },
  "speaking": [
    {
      "english": "",
      "example": "",
      "pronunciation": ""
    }
  ],
  "listening": [
    {
      "audio": "",
      "options": [],
      "answer": ""
    }
  ],
  "writing": [
    {
      "prefix": [],
      "suffix": "",
      "answer": ""
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 JSON REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Grammar:
• include affirmative, negative, questions, contractions, short answers

Reading:
• 10 questions

Speaking:
• 10 prompts

Listening:
• 10 exercises

Writing:
• 10 exercises

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 LEVEL ADAPTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A1 → simple, short, basic
A2 → daily communication
B1 → opinions, experiences
B2 → complex ideas
C1 → advanced communication
C2 → near-native

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FINAL VALIDATION RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before finishing, verify:

• Does every section clearly support the Objective?
• Are all examples aligned with the Objective?
• Can a student achieve the Objective ONLY using this lesson?

If not → adjust before output.`;
    }
}