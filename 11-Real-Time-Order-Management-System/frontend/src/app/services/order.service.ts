import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:3000/orders';

  constructor(
    private http: HttpClient
  ) {}

  getOrder(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }

  updateOrder(
    id: number,
    status: string
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      { status }
    );
  }
}