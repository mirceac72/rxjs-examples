---
title: Is it first or last?
---

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
