import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

const API_HOST_FEED = environment.apiHostFeed;
const API_HOST_USER = environment.apiHostUser;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
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

  get(api,endpoint): Promise<any> {
    const url = `${api === 'feed' ? API_HOST_FEED : API_HOST_USER}${endpoint}`;
    const req = this.http.get(url, this.httpOptions).pipe(map(ApiService.extractData));

    return req
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }

  post(api,endpoint, data): Promise<any> {
    const url = `${api === 'feed' ? API_HOST_FEED : API_HOST_USER}${endpoint}`;
    return this.http.post<HttpEvent<any>>(url, data, this.httpOptions)
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }

  async upload(api,endpoint: string, file: File, payload: any): Promise<any> {
    const signed_url = (await this.get(api,`${endpoint}/signed-url/${file.name}`)).url;

    const headers = new HttpHeaders({'Content-Type': file.type});
    const req = new HttpRequest( 'PUT', signed_url, file,
                                  {
                                    headers: headers,
                                    reportProgress: true, // track progress
                                  });

    return new Promise ( resolve => {
        this.http.request(req).subscribe((resp) => {
        if (resp && (<any> resp).status && (<any> resp).status === 200) {
          resolve(this.post(api,endpoint, payload));
        }
      });
    });
  }
}
