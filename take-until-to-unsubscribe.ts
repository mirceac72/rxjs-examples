import { interval, of, timer, EMPTY } from 'rxjs';
import { delay, scan, switchMap, take, takeUntil } from 'rxjs/operators';

const endless$ = interval(1000);

class Subscriber {
    constructor(private name: string) {}
    next = (x: any) => { console.log(`${this.name}. Next value: ${x}.`); };
    error = (x: any) => { console.log(`${this.name}. Error: ${x}.`); };
    complete = () => { console.log(`${this.name} completed.`); }
}

const createSubscriber = (name: string) => new Subscriber(name);

const endIn3Seconds$ = of(true).pipe(
    delay(3000)
);

endless$.pipe(
    takeUntil(endIn3Seconds$)
).subscribe(createSubscriber('First subscription'));

const addWith10For10Times = (x: number) => interval(300).pipe(
    take(10),
    scan((acc) => acc + 10, x)
)

endless$.pipe(
    takeUntil(endIn3Seconds$),
    switchMap(addWith10For10Times)
).subscribe(createSubscriber('Subscription taking longer than expected'));

endless$.pipe(
    switchMap(addWith10For10Times),
    takeUntil(endIn3Seconds$),
).subscribe(createSubscriber('Subscription completing in 3 seconds'));

const needUnsubscribeSubscription = endless$.pipe(
    takeUntil(EMPTY)
).subscribe(createSubscriber('EMPTY will not stop'));

timer(10000).subscribe(() => {
    needUnsubscribeSubscription.unsubscribe();
});
