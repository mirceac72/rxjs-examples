import { Observable, Observer, range } from "rxjs";
import { flatMap, retry } from "rxjs/operators";
import { createSubscriber } from "./subscriber";

const sometimesFails$ = Observable.create(function (observer: Observer<number>) {
    const num = Math.random();
    if (num < 0.5) {
        observer.error(new Error('too small'));
        return;
    }
    observer.next(num);
    observer.complete();
})

const generateRandomNumbers$ = range(0, 9).pipe(
    flatMap(_ => sometimesFails$)
) 

generateRandomNumbers$.subscribe(createSubscriber('Display less than 10 random numbers'));

const generate10RandomNumbers$ = range(0, 9).pipe(
    flatMap(_ => sometimesFails$.pipe(
        retry()
    ))
)

generate10RandomNumbers$.subscribe(createSubscriber('Display 10 random numbers'));
