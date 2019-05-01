# RxJS Usage Patterns

The repository contains a set of RxJS usage patterns  if not well understood can make a programmer to spend a couple of hours debugging. 

## How to run the examples

Compile the typescript files using

> npm run tsc

The resulting Javascript files will be stored into ./dist folder.

Run a specific Javascript file using

> node ./dist/javascript-file-name

The examples were tested with Node.js 11.14.0

## Is it first or last?

Converting an observable to a promise using `toPromise` operator is quite common but there is a catch. The value provided by the promise is the last value emitted by the observable before completing. 

```typescript
const numbers$ = of(1,2,3,4,5)

const lastNumberPromise = numbers$.toPromise()

lastNumberPromise.then(console.log);
```

The value displayed when running the above code snippet is 5. This may be unexpected because sometimes we want to have the promise resolved with the first emitted value. If this is the case, then `take` operator should be used to complete the resulted promise sooner.

```typescript
const firstNumberPromise = numbers$.pipe(
    take(1)
).toPromise();

firstNumberPromise.then(console.log)
```

The value 1 will be displayed when running this code snippet.

If the observable never completes then the promise will never provide a value, which may be quite surprising.

```typescript
const neverCompletingPromise = NEVER.pipe(
    startWith(6)
).toPromise();

neverCompletingPromise.then(console.log);
```

No value will be displayed when running the above lines of code.

The code from this section can be found in the file:

> observable-to-promise.ts


## Avoid to unsubscribe with takeUntil

Subscribing to RxJS flows is common in Javascript/Typescript applications but forgetting to unsubscribe will cause leaks and loss of performance. Checking that each subscription was properly unsubscribed is a tedious task but unsubscribing can be avoided if the flows are closed using the `takeUntil` operator.

```typescript
const endless$ = interval(1000);
```

As its name says, `$endless` is a flow which will provide an infinite sequence of integers, one number per second.

```typescript
class Subscriber {
    constructor(private name: string) {}
    next = (x: any) => { console.log(`${this.name}. Next value: ${x}.`); };
    error = (x: any) => { console.log(`${this.name}. Error: ${x}.`); };
    complete = () => { console.log(`${this.name} completed.`); }
}

const createSubscriber = (name: string) => new Subscriber(name);
```

Factory method `createSubscriber` creates a subscriber which logs every event received from the subscribed flow.

If subscribing directly to `$endless`, the numbers will flow without stopping, but our intention is to stop the flow when an event occurs. This can be achieved by using the `takeUntil` operator as is shown below.

```typescript
const endIn3Seconds$ = of(true).pipe(
    delay(3000)
);

endless$.pipe(
    takeUntil(endIn3Seconds$)
).subscribe(createSubscriber('First subscription'));
```

The output if running the above code in Node.js will be
```
First subscription. Next value: 0.
First subscription. Next value: 1.
First subscription completed.
```

The pipes may get more complicated than the simple one from above and in this case the placement of `takeUntil` will become important as we will see in the next example.

```typescript
const addWith10For10Times = (x: number) => interval(300).pipe(
    take(10),
    scan((acc) => acc + 10, x)
)
```

Function `addWith10For10Times`, for a given number, creates an Observable which will emit a sequence of 10 numbers, the first one being the number received as argument plus 10 and the subsequent ones being obtained by adding 10 to the previously emitted number. There will be a time interval of 300 ms between these numbers. 

```typescript
endless$.pipe(
    takeUntil(endIn3Seconds$),
    switchMap(addWith10For10Times)
).subscribe(createSubscriber('Subscription taking longer than expected'));
```

We may expect that the subscriber will cease to receive numbers after three seconds but if we run the code then we will see that this is not happening.

```
Subscription taking longer than expected. Next value: 10.
Subscription taking longer than expected. Next value: 20.
Subscription taking longer than expected. Next value: 30.
Subscription taking longer than expected. Next value: 11.
Subscription taking longer than expected. Next value: 21.
Subscription taking longer than expected. Next value: 31.
Subscription taking longer than expected. Next value: 41.
Subscription taking longer than expected. Next value: 51.
Subscription taking longer than expected. Next value: 61.
Subscription taking longer than expected. Next value: 71.
Subscription taking longer than expected. Next value: 81.
Subscription taking longer than expected. Next value: 91.
Subscription taking longer than expected. Next value: 101.
Subscription taking longer than expected completed.
```

This output is caused by the fact that `takeUntil` has no effect on the observable provided by `switchMap` being placed before him in the processing pipe.

If we change the order in the pipe

```typescript
endless$.pipe(
    switchMap(addWith10For10Times),
    takeUntil(endIn3Seconds$),
).subscribe(createSubscriber('Subscription completing in 3 seconds'));
```
then the output will be
```
Subscription completing in 3 seconds. Next value: 10.
Subscription completing in 3 seconds. Next value: 20.
Subscription completing in 3 seconds. Next value: 30.
Subscription completing in 3 seconds. Next value: 11.
Subscription completing in 3 seconds. Next value: 21.
Subscription completing in 3 seconds. Next value: 31.
Subscription completing in 3 seconds completed.
```

One more important thing, it is not enough that observable given as parameter to `takeUntil` to complete. It is necessary that this observable to emit a value.

Below subscription will never complete because `EMPTY` completes without emitting a value.

```typescript
endless$.pipe(
    takeUntil(EMPTY)
).subscribe(createSubscriber('EMPTY will not stop'));
```

The corresponding code can be found in the file:

> take-until-to-unsubscribe.ts

## Prepare for the worst

Observables may throw errors as well and this can happen quite frequently if the observable delivers the result of a network call. Dealing with these errors should be a first class citizen in our design and not just an afterthought because an error can bring down an entire workflow.

```typescript
const sometimesFails = Observable.create(function (observer: Observer<number>) {
    const num = Math.random();
    if (num < 0.5) {
        observer.error(new Error('too small'));
        return;
    }
    observer.next(num);
    observer.complete();
})
```

The above observable will either return a random number greater or equal with 0.5 or will throw an error. The thrown error will hinder our efforts to generate ten random numbers with the below code because as soon as the error is thrown, no other number will be generated.

```typescript
const generateRandomNumbers = range(0, 9).pipe(
    flatMap(_ => sometimesFails)
) 
```

Fortunately, 'rxjs' provides the `retry` operator which will resubscribe if an error is thrown. Using it, the next observable will generate the desired 10 random numbers.

```typescript
const generate10RandomNumbers = range(0, 9).pipe(
    flatMap(_ => sometimesFails.pipe(
        retry()
    ))
)
```

The file containing these observable definitions is

> supervise.ts

The output of a typical run is

```
Display less than 10 random numbers. Next value: 0.8692660851096263.
Display less than 10 random numbers. Next value: 0.6363221615867083.
Display less than 10 random numbers. Next value: 0.752480986004695.
Display less than 10 random numbers. Next value: 0.8960818920937872.
Display less than 10 random numbers. Error: Error: too small.
Display 10 random numbers. Next value: 0.5407133767301922.
Display 10 random numbers. Next value: 0.7022142601776933.
Display 10 random numbers. Next value: 0.5061273947079132.
Display 10 random numbers. Next value: 0.8427191046863656.
Display 10 random numbers. Next value: 0.6114915905920393.
Display 10 random numbers. Next value: 0.7747592452818364.
Display 10 random numbers. Next value: 0.7940229590988928.
Display 10 random numbers. Next value: 0.5778917098644962.
Display 10 random numbers. Next value: 0.6038178749791165.
Display 10 random numbers completed.
```