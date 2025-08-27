import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateRangeValidator(
  group: AbstractControl
): ValidationErrors | null {
  const start = group.get('start')?.value;
  const end = group.get('end')?.value;
  if (!start || !end) return null;
  return start <= end ? null : { rangeError: true };
}
