import { Component, inject } from '@angular/core';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  notifications: any[] = [];
  private socketService: SocketService = inject(SocketService);

  ngOnInit(): void {

    this.socketService.getNotifications()
      .subscribe((data) => {

        console.log(data);

        this.notifications.unshift(data);
      });
  }
}
