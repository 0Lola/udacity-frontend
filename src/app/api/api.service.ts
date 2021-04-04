import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import Axios from 'axios';

const API_HOST= `${environment.apiHost}:8080/api/v0`;
// const API_HOST= `http://localhost:8080/api/v0`;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json','Access-Control-Allow-Origin': `*`,'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'})
  };

  token: string;
  api: string;

  constructor(private http: HttpClient) 
  { }

  static handleError(error: Error) {
    alert(error.message);
  }

  static extractData(res: HttpEvent<any>) {
    const body = res;
    return body || { };
  }

  setAuthToken(token) {
    this.httpOptions.headers = 
    this.httpOptions.headers
     .append('Authorization', `jwt ${token}`)
     .append('Access-Control-Allow-Origin', `*`);
    this.token = token;
  }

  get(endpoint): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    const req = this.http.get(url, this.httpOptions).pipe(map(ApiService.extractData));

    return req
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }


  post(endpoint, data): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    return this.http.post<HttpEvent<any>>(url, data, this.httpOptions)
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }

  getExternal(url): Promise<any> {

    const option = {
        headers: new HttpHeaders({
            'access-control-allow-headers': '*',
            'access-control-allow-methods': 'GET,PUT,POST,DELETE',
            'access-control-allow-origin': '*',
            'content-type': 'application/json'})
      };
    return this.http.get(url, option)
            .pipe(map(ApiService.extractData))
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }

  async upload(endpoint: string, file: File, payload: any): Promise<any> {
    const res = await Axios.get(`https://kak3jg97ng.execute-api.us-east-1.amazonaws.com/dev/getUploadUrl/${file.name}`, {
        headers: {
          'Content-Type': 'application/json'
        },
      })
    // const res = (await Axios.get(`${endpoint}/signed-url/${file.name}`));
    console.log('signed url : '+ JSON.stringify(res.data));
    const url = res.data.uploadUrl
    const headers = new HttpHeaders({
        'Content-Type': file.type,
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'});

    const req = new HttpRequest( 'PUT', url, file,
                                  {
                                    headers: headers,
                                    reportProgress: true, // track progress
                                  });

    return new Promise ( resolve => {
        this.http.request(req).subscribe((resp) => {
        if (resp && (<any> resp).status && (<any> resp).status === 200) {
          resolve(this.post(endpoint, payload));
        }
      });
    });
  }
}