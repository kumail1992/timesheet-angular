import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  LogDTO,
  NewTask,
  TaskListParam,
  TaskTypeList,
} from './timesheet.model';

@Injectable({
  providedIn: 'root',
})
export class TimesheetService {
  http = inject(HttpClient);

  getAllTaskTypes(params?: TaskListParam): Observable<TaskTypeList[]> {
    return this.http.get<TaskTypeList[]>(environment.baseUrl + 'tasktype', {
      params: params,
    });
  }

  getLogs(params?: Partial<LogDTO>): Observable<LogDTO[]> {
    return this.http.get<LogDTO[]>(environment.baseUrl + 'log', { params });
  }

  createLog(payload: NewTask) {
    return this.http.post<LogDTO>(environment.baseUrl + 'log', payload);
  }
}
