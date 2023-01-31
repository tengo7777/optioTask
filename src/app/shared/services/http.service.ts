import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  roleApiUrl = 'https://development.api.optio.ai/api/v2/reference-data';
  apiUrl = 'https://development.api.optio.ai/api/v2/admin/users';
  headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${environment.bearerAuthToken}` });
  constructor(private http: HttpClient) { }


  getAllUsers(bodyItem: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/find`, bodyItem, { headers: this.headers });
  }


  addOrUpdateUser(bodyItem: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, bodyItem, { headers: this.headers });
  }

  deleteUSer(bodyItem: any): Observable<any> {
    return this.http.post<boolean>(`${this.apiUrl}/remove`, bodyItem, { headers: this.headers });
  }

  getAllRoles(bodyItem: any): Observable<any> {
    return this.http.post<any>(`${this.roleApiUrl}/find`, bodyItem, { headers: this.headers });
  }


}
