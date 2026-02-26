import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../core/services/alert.service';

@Component({
    standalone: true,
    selector: 'app-recommended-resources',
    imports: [CommonModule],
    templateUrl: './recommended-resources.component.html',
    styleUrl: './recommended-resources.component.scss'
})
export class RecommendedResourcesComponent implements OnInit {
    recommendedLinks: any[] = [];

    constructor(
        private http: HttpClient,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.alertService.closeLoading();
        this.loadRecommendedLinks();
    }

    loadRecommendedLinks(): void {
        this.http.get<any[]>('assets/recommended-links.json').subscribe({
            next: (links) => {
                this.recommendedLinks = links;
            },
            error: (error) => {
                console.error('Error loading recommended links:', error);
            }
        });
    }
}
