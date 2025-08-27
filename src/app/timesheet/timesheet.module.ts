import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';

import { TimesheetRoutingModule } from './timesheet-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TimesheetComponent } from './timesheet.component';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [TimesheetComponent],
  imports: [
    CommonModule,
    TimesheetRoutingModule,
    AutoCompleteModule,
    ReactiveFormsModule,
    CalendarModule,
    TableModule,
    InputTextModule,
  ],
})
export class TimesheetModule {}
