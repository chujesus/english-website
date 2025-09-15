import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import moduleTopicsA1 from './english_a1_topics.json';
import moduleTopicsA2 from './english_a2_topics.json';
import moduleTopicsB1 from './english_b1_topics.json';
import moduleTopicsB2 from './english_b2_topics.json'

export interface Topic {
  title: string;
  objective: string;
  cefrLevel: string;
  examples: string[];
  keywords: string[];
}

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  moduleId: number | null = null;
  moduleTitle: string | null = null;
  topics: Topic[] = [];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.moduleId = +params['id'];
      this.moduleTitle = params['title'];

      if (this.moduleId === 0)
        this.topics = moduleTopicsA1;
      if (this.moduleId === 1)
        this.topics = moduleTopicsA2;
      if (this.moduleId === 2)
        this.topics = moduleTopicsB1;
      if (this.moduleId === 3)
        this.topics = moduleTopicsB2;
    });
  }
}
