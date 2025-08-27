import { Component, computed, inject, signal } from '@angular/core';
import { TimesheetService } from './timesheet.service';
import { LogDTO, NewTask, TaskTypeList } from './timesheet.model';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
} from 'rxjs';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrl: './timesheet.component.scss',
})
export class TimesheetComponent {
  private timeSheetService = inject(TimesheetService);
  fb = inject(NonNullableFormBuilder);
  fetchingTypes = signal<boolean>(false);
  taskTypeList = signal<TaskTypeList[]>([]);
  logs = signal<LogDTO[] | []>([]);
  searchCtrl = new FormControl('');
  form!: FormGroup;
  savingForm = signal<boolean>(false);
  loadingLogs = signal<boolean>(false);

  ngOnInit() {
    this.searchCtrl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe({
        next: (res) => {
          this.getAllLogs({ task: res?.trim() ?? '' });
        },
      });
    this.getAllLogs();
    this.initializeForm();
  }

  getAllLogs(params?: Partial<NewTask>) {
    this.loadingLogs.set(true);
    this.timeSheetService
      .getLogs(params)
      .pipe(finalize(() => this.loadingLogs.set(false)))
      .subscribe({
        next: (res) => {
          this.logs.set(res);
        },
      });
  }

  initializeForm() {
    this.form = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
      task: ['', Validators.required],
    });
  }

  filterTypes(event: AutoCompleteCompleteEvent) {
    let query = event.query;

    this.timeSheetService
      .getAllTaskTypes({ name: query })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        catchError(() => {
          alert('No type found');
          return of([]);
        })
      )
      .subscribe({
        next: (res) => {
          this.taskTypeList.set(res);
        },
      });
  }

  onSave() {
    if (this.form.invalid) return;
    const formValue = { ...this.form.value };
    this.savingForm.set(true);
    this.timeSheetService
      .createLog(formValue)
      .pipe(finalize(() => this.savingForm.set(false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.getAllLogs();
        },
      });
  }

  filterLogs(e: any) {
    this.searchCtrl.setValue(e.target.value);
  }
}
