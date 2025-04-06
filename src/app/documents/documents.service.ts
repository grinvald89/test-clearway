import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { IDocuments, IPage } from './model';

@Injectable()
export class DocumentsService {
  private readonly httpClient = inject(HttpClient);

  public getDocuments(): Observable<IDocuments> {
    return this.httpClient
      .get<IDocuments>('/mock/1.json');
  }
}
