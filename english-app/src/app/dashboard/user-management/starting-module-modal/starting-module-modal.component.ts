import { Component, OnInit, OnChanges, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ICourse } from '../../../shared/interfaces/models';

@Component({
    selector: 'app-starting-module-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './starting-module-modal.component.html',
    styleUrl: './starting-module-modal.component.scss'
})
export class StartingModuleModalComponent implements OnInit, OnChanges {
    @Input() show = false;
    @Input() userName = '';
    @Output() modalClose = new EventEmitter<void>();
    @Output() moduleSelected = new EventEmitter<string>();

    availableModules: ICourse[] = [];
    selectedModule = '';
    loading = false;
    error = '';

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        if (this.show) {
            this.loadAvailableModules();
        }
    }

    ngOnChanges(): void {
        if (this.show && this.availableModules.length === 0) {
            this.loadAvailableModules();
        }
    }

    loadAvailableModules(): void {
        this.loading = true;
        this.error = '';

        // Use hardcoded modules for now to ensure functionality
        this.availableModules = [
            { id: 1, level: 'A1' as 'A1', title: 'English A1 - Beginner', description: 'Basic vocabulary and simple phrases' },
            { id: 2, level: 'A2' as 'A2', title: 'English A2 - Elementary', description: 'Common expressions and routine tasks' },
            { id: 3, level: 'B1' as 'B1', title: 'English B1 - Intermediate', description: 'Familiar topics and personal interests' },
            { id: 4, level: 'B2' as 'B2', title: 'English B2 - Upper Intermediate', description: 'Complex topics and abstract ideas' }
        ];

        // Set default selection to A1
        this.selectedModule = 'A1';
        this.loading = false;

        // Uncomment this when backend is ready
        /*
        this.userService.getAvailableModules().subscribe({
            next: (response: any) => {
                this.availableModules = response.data || [];
                // Set default selection to A1 if available
                if (this.availableModules.length > 0) {
                    this.selectedModule = this.availableModules[0].level;
                }
                this.loading = false;
            },
            error: (error: any) => {
                this.error = error.error?.message || 'Error loading modules';
                this.loading = false;
            }
        });
        */
    }

    closeModal(): void {
        this.modalClose.emit();
    }

    confirmSelection(): void {
        if (this.selectedModule) {
            this.moduleSelected.emit(this.selectedModule);
        }
    }

    selectModule(level: string): void {
        this.selectedModule = level;
    }

    getLevelBadgeClass(level: string): string {
        switch (level) {
            case 'A1': return 'bg-info';
            case 'A2': return 'bg-primary';
            case 'B1': return 'bg-warning';
            case 'B2': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    getModuleDescription(level: string): string {
        switch (level) {
            case 'A1': return 'Beginner level - Basic vocabulary and simple phrases';
            case 'A2': return 'Elementary level - Common expressions and routine tasks';
            case 'B1': return 'Intermediate level - Familiar topics and personal interests';
            case 'B2': return 'Upper-intermediate level - Complex topics and abstract ideas';
            default: return 'English module';
        }
    }

    getUnlockedModulesText(selectedLevel: string): string {
        const levels = ['A1', 'A2', 'B1', 'B2'];
        const selectedIndex = levels.indexOf(selectedLevel);

        if (selectedIndex === -1) return '';

        const unlockedLevels = levels.slice(selectedIndex);

        if (unlockedLevels.length === 1) {
            return `Only ${selectedLevel} will be available.`;
        } else {
            return `${unlockedLevels.join(', ')} will be available.`;
        }
    }

    getBlockedModulesText(selectedLevel: string): string {
        const levels = ['A1', 'A2', 'B1', 'B2'];
        const selectedIndex = levels.indexOf(selectedLevel);

        if (selectedIndex === -1 || selectedIndex === 0) return '';

        const blockedLevels = levels.slice(0, selectedIndex);

        if (blockedLevels.length === 0) return '';

        return `${blockedLevels.join(', ')} will be blocked.`;
    }
}