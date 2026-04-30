import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { SensorReading, Prediction, Alert } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private sensorDataSubject = new BehaviorSubject<SensorReading | null>(null);
  private predictionSubject = new BehaviorSubject<Prediction | null>(null);
  private alertSubject = new BehaviorSubject<Alert | null>(null);
  private kitStatusSubject = new BehaviorSubject<any>(null);

  public sensorData$ = this.sensorDataSubject.asObservable();
  public prediction$ = this.predictionSubject.asObservable();
  public alert$ = this.alertSubject.asObservable();
  public kitStatus$ = this.kitStatusSubject.asObservable();

  constructor() {}

  connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('sensor-data-update', (data: SensorReading) => {
      this.sensorDataSubject.next(data);
    });

    this.socket.on('prediction-update', (data: Prediction) => {
      this.predictionSubject.next(data);
    });

    this.socket.on('new-alert', (data: Alert) => {
      this.alertSubject.next(data);
    });

    this.socket.on('kit-status-update', (data: any) => {
      this.kitStatusSubject.next(data);
    });
  }

  joinTerrain(terrainId: string): void {
    if (this.socket) {
      this.socket.emit('join-terrain', terrainId);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
