import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AlertService } from '../core/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    debugger;
    this.alertService.closeLoading();
  }
}
