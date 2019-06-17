---
id: replay-vs-behavior
title: ReplaySubject vs BehaviorSubject
---

## ReplaySubject vs BehaviorSubject

`ReplaySubject` and `BehaviorSubject` are `Subject` class extensions which are quite similar in the sense that they are both caching the emitted values, these values being provided imediatelly to any subscriber. `ReplaySubject` is able to cache one or more values (the size of the cache being specified as parameter within constructor) while `BehaviorSubject` will cache only the last value. Usually, the desired size of the cache is one, so this difference is not very significant.

However, are also other important characteristics which will help us to decide which of them to use.

First, `BehaviorSubject` always has a cached value which will be provided imediatelly to any subscriber. The first value flowed through a `BehaviorSubject` instance is provided as parameter in constructor. In contrast, `ReplaySubject` does not have a cached value until the first `next` call.

```typescript
const replay$ = new ReplaySubject<boolean>();
const behavior$ = new BehaviorSubject<boolean>(true);

replay$.subscribe(createSubscriber('Replay initial subscriber'));
behavior$.subscribe(createSubscriber('Behavior initial subscriber'));
```

The output of the above piece of code  will be:
```
Behavior initial subscriber. Next value: true.
```

So, if your subscribers need a value right away, better you go with `BehaviorSubject`. If there is no first value available when the subject is created then `ReplaySubject` comes to rescue.

A second important deference is when the subject completes. `ReplaySubject` instances will still emit all cached values even completed while `BehaviorSubject` will indicate only its completion.

```typescript
replay$.complete();
behavior$.complete();

replay$.subscribe(createSubscriber('Replay late subscriber'));
behavior$.subscribe(createSubscriber('Behavior late subscriber'));
```

The output is
```
Replay late subscriber. Next value: true.
Replay late subscriber completed.
Behavior late subscriber completed.
```

So, if _complete means complete, no more values_ then `BehaviorSubject` should be used.

The source code for this example can be found in:

> replay-subject-vs-behavior-subject.ts
