import { ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

export const accountDatesValidator: ValidatorFn = (
    control: AbstractControl,
): ValidationErrors | null => {
    const opened_on = control.get('opened_on')?.value;
    const closed_on = control.get('closed_on')?.value;

    if (!opened_on) return null;
    if (!closed_on) return null;
    if (closed_on > opened_on) return null;
    return { accountDates: { value: 'Close date should be after open date' } };
};
