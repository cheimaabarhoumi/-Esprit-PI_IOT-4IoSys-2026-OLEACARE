import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User, Kit, Terrain, SensorReading, Prediction,
  Alert, ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Admin endpoints
  getUsers(skip: number = 0, limit: number = 10): Observable<ApiResponse<User[]>> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/admin/users`, { params });
  }

  createUser(user: any): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/admin/users`, user);
  }

  updateUser(userId: string, data: any): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/admin/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<ApiResponse<User>> {
    return this.http.delete<ApiResponse<User>>(`${this.apiUrl}/admin/users/${userId}`);
  }

  getKits(skip: number = 0, limit: number = 10): Observable<ApiResponse<Kit[]>> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<Kit[]>>(`${this.apiUrl}/admin/kits`, { params });
  }

  createKit(kit: any): Observable<ApiResponse<Kit>> {
    return this.http.post<ApiResponse<Kit>>(`${this.apiUrl}/admin/kits`, kit);
  }

  updateKit(kitId: string, data: any): Observable<ApiResponse<Kit>> {
    return this.http.put<ApiResponse<Kit>>(`${this.apiUrl}/admin/kits/${kitId}`, data);
  }

  deleteKit(kitId: string): Observable<ApiResponse<Kit>> {
    return this.http.delete<ApiResponse<Kit>>(`${this.apiUrl}/admin/kits/${kitId}`);
  }

  assignKit(kitId: string, farmerId: string, terrainId?: string): Observable<ApiResponse<Kit>> {
    return this.http.post<ApiResponse<Kit>>(
      `${this.apiUrl}/admin/kits/${kitId}/assign`,
      { farmerId, terrainId }
    );
  }

  getAdminTerrains(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admin/terrains`);
  }

  getKitStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats/kits`);
  }

  // Farmer endpoints
  getMyKits(): Observable<ApiResponse<Kit[]>> {
    return this.http.get<ApiResponse<Kit[]>>(`${this.apiUrl}/farmer/kits`);
  }

  assignMyKitToTerrain(kitId: string, terrainId: string): Observable<ApiResponse<Kit>> {
    return this.http.put<ApiResponse<Kit>>(
      `${this.apiUrl}/farmer/kits/${kitId}/terrain`,
      { terrainId }
    );
  }

  unassignMyKitFromTerrain(kitId: string): Observable<ApiResponse<Kit>> {
    return this.http.delete<ApiResponse<Kit>>(
      `${this.apiUrl}/farmer/kits/${kitId}/terrain`
    );
  }

  getTerrains(): Observable<ApiResponse<Terrain[]>> {
    return this.http.get<ApiResponse<Terrain[]>>(`${this.apiUrl}/farmer/terrains`);
  }

  createTerrain(terrain: any): Observable<ApiResponse<Terrain>> {
    return this.http.post<ApiResponse<Terrain>>(`${this.apiUrl}/farmer/terrains`, terrain);
  }

  updateTerrain(terrainId: string, data: any): Observable<ApiResponse<Terrain>> {
    return this.http.put<ApiResponse<Terrain>>(`${this.apiUrl}/farmer/terrains/${terrainId}`, data);
  }

  deleteTerrain(terrainId: string): Observable<ApiResponse<Terrain>> {
    return this.http.delete<ApiResponse<Terrain>>(`${this.apiUrl}/farmer/terrains/${terrainId}`);
  }

  // Sensor data
  getLatestSensorData(terrainId: string): Observable<ApiResponse<SensorReading[]>> {
    return this.http.get<ApiResponse<SensorReading[]>>(
      `${this.apiUrl}/farmer/sensors/${terrainId}/latest`
    );
  }

  // Predictions
  getLatestPrediction(terrainId: string): Observable<ApiResponse<Prediction>> {
    return this.http.get<ApiResponse<Prediction>>(
      `${this.apiUrl}/farmer/predictions/${terrainId}/latest`
    );
  }

  getAllPredictions(terrainId: string, skip: number = 0, limit: number = 10): Observable<ApiResponse<Prediction[]>> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<Prediction[]>>(
      `${this.apiUrl}/farmer/predictions/${terrainId}`,
      { params }
    );
  }

  generatePrediction(terrainId: string): Observable<ApiResponse<Prediction>> {
    return this.http.post<ApiResponse<Prediction>>(
      `${this.apiUrl}/farmer/predictions/${terrainId}/generate`,
      {}
    );
  }

  // Alerts
  getAlerts(skip: number = 0, limit: number = 10): Observable<ApiResponse<Alert[]>> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<Alert[]>>(`${this.apiUrl}/farmer/alerts`, { params });
  }

  markAlertAsRead(alertId: string): Observable<ApiResponse<Alert>> {
    return this.http.put<ApiResponse<Alert>>(
      `${this.apiUrl}/farmer/alerts/${alertId}/read`,
      {}
    );
  }

  getUnreadAlertCount(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/farmer/alerts/unread/count`);
  }

  predictLive(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/farmer/predict-live`,
      data
    );
  }

  // YOLO Detection
  runYoloDetection(terrainId: string, imageBase64?: string): Observable<ApiResponse<any>> {
    const payload = imageBase64 ? { image: imageBase64 } : {};
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/farmer/yolo/detect/${terrainId}`,
      payload
    );
  }

  getYoloDetectionHistory(terrainId: string, skip: number = 0, limit: number = 10): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/farmer/yolo/latest/${terrainId}`,
      { params }
    );
  }

  getLatestYoloDetection(terrainId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/farmer/yolo/latest/${terrainId}`
    );
  }

  checkYoloHealth(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/farmer/yolo/health`
    );
  }
}


