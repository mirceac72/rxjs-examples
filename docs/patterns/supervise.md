---
title: Prepare for the worst
---

# Prepare for the worst

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
