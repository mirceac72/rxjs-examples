import { of, NEVER } from "rxjs";
import { take, startWith } from "rxjs/operators";

const numbers$ = of(1,2,3,4,5)

const lastNumberPromise = numbers$.toPromise()

lastNumberPromise.then(console.log);

const firstNumberPromise = numbers$.pipe(
    take(1)
).toPromise();

firstNumberPromise.then(console.log)

const neverCompletingPromise = NEVER.pipe(
    startWith(6)
).toPromise();

neverCompletingPromise.then(console.log);
