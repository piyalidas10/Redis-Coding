import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { OrderService } from '../services/order.service';
import { SocketService } from '../services/socket.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-order-dashboard',
  standalone: true,
  imports: [NgClass],
  templateUrl: './order-dashboard.component.html',
  styleUrls: ['./order-dashboard.component.scss']
})
export class OrderDashboardComponent implements OnInit {

  order: any;
  loading = false;
  private orderService: OrderService = inject(OrderService);
  private socketService: SocketService = inject(SocketService);

  ngOnInit(): void {

    this.loadOrder();

    this.socketService
      .listen('order-updated')
      .subscribe((data: any) => {

        console.log(
          'Realtime Order Update',
          data
        );

        this.order = data;
      });
  }

  loadOrder(): void {

    this.loading = true;

    this.orderService
      .getOrder(1)
      .subscribe({
        next: (response: any) => {

          this.order = response;

          this.loading = false;
        },
        error: () => {

          this.loading = false;
        }
      });
  }
}