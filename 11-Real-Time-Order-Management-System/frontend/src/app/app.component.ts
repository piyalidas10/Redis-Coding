import { Component, inject } from '@angular/core';
import { OrderDashboardComponent } from './order-dashboard/order-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrderDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Redis PubSub Order Dashboard';
}
