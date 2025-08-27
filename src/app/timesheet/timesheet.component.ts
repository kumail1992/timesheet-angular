import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { dateRangeValidator } from '../core/utilities/helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrl: './timesheet.component.scss',
})
export class TimesheetComponent implements OnInit {
  private readonly timeSheetService = inject(TimesheetService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly fb = inject(NonNullableFormBuilder);
  readonly searchCtrl = new FormControl<string>('', { nonNullable: true });
  form!: FormGroup;
  readonly minDate = new Date();

  readonly fetchingTypes = signal<boolean>(false);
  readonly taskTypeList = signal<TaskTypeList[]>([]);
  readonly logs = signal<LogDTO[] | []>([]);
  readonly savingForm = signal<boolean>(false);
  readonly loadingLogs = signal<boolean>(true);

  ngOnInit() {
    this.listenToSearchLogs();
    this.initializeForm();
  }

  listenToSearchLogs() {
    this.searchCtrl.valueChanges
      .pipe(
        startWith(this.searchCtrl.value),
        map((query) => query.trim().toLowerCase()),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        switchMap((query) =>
          this.getAllLogs(query ? { task: query } : undefined)
        )
      )
      .subscribe();
  }

  getAllLogs(params?: Partial<NewTask>) {
    this.loadingLogs.set(true);
    return this.timeSheetService.getLogs(params).pipe(
      catchError((err) => {
        console.error(err);
        return of<LogDTO[]>([]);
      }),
      tap((d) => this.logs.set(d)),
      finalize(() => this.loadingLogs.set(false))
    );
  }

  initializeForm() {
    this.form = this.fb.group(
      {
        start: ['', Validators.required],
        end: ['', Validators.required],
        task: ['', Validators.required],
      },
      { validators: dateRangeValidator }
    );
  }

  filterTypes(event: AutoCompleteCompleteEvent) {
    let query = event.query;

    this.timeSheetService
      .getAllTaskTypes({ name: query })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        catchError(() => {
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
          this.searchCtrl.setValue('', { emitEvent: false });
          this.getAllLogs().subscribe();
        },
      });
  }
}
