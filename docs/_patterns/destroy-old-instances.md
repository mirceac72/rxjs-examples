---
id: destroy-old-instances
title: Destroy old instances issued by a flow
---

## Destroy old instances issued by a flow

A common scenario while pushing new class instances through RxJS streams is to call some clean-up code for the previous emitted instances. This is the case with the instances of the `ElementWithResources` class which contain a stream member `flow$` that needs to be completed by a `destroy()` call.

```typescript
class ElementWithResources {
    private _flow$ = new BehaviorSubject(1);
    constructor(public readonly id: number) {
        this._flow$ = new BehaviorSubject(id);
    }
    public get flow$(): BehaviorSubject<number> {
        return this._flow$;
    }
    public destroy(): void {
        this._flow$.complete();
    }
}

function createElementFlow(...ids: number[]): Observable<ElementWithResources> {
    return of(...ids).pipe(
        map(id => new ElementWithResources(id))
    )
}
```

The `createElementFlow` function creates a flow of `ElementWithResources` instances, flow which can be consumed using a second function, `consumeElements`.

```typescript
function consumeElements(elements$: Observable<ElementWithResources>) {
    elements$.subscribe(element => {
        element.flow$.subscribe(createSubscriber(`Resource subscriber ${element.id}`));
    });
}
```

Within `consumeElements`, `flow$` of each element is subscribed but these subscriptions are never completed as a `consumeElements(createElementFlow(1, 2))` call shows. The messages displayed in the console indicate that none of the two subscriptions is completed.
```
Resource subscriber 1. Next value: 1.
Resource subscriber 2. Next value: 2.
```

A possible solution is to use the `scan` operator from *RxJS* library which provides access to the previous value emitted by a flow.
```typescript
const flowWhichClearResources$ = createElementFlow(3, 4).pipe(
    scan((old: ElementWithResources, current: ElementWithResources) => {
        if (old) {
            old.destroy();
        }
        return current;
    })
);
```

The solution is still incomplete because, after  a `consumeElements(flowWhichClearResources$)` call, we find out that the subscription for the last element is not completed.
```
Resource subscriber 3. Next value: 3.
Resource subscriber 3 completed.
Resource subscriber 4. Next value: 4.
```

This can be resolved by inserting a last `undefined` element into the flow which will be filtered out after the scan.
```typescript
const flowWhichClearAllResources$ = createElementFlow(5, 6).pipe(
    endWith(undefined),
    scan((old: ElementWithResources, current: ElementWithResources) => {
        if (old) {
            old.destroy();
        }
        return current;
    }),
    filter(element => !!element)
);
```

The `consumeElements(flowWhichClearAllResources$)` call finally shows that all subscriptions are completed.
```
Resource subscriber 5. Next value: 5.
Resource subscriber 5 completed.
Resource subscriber 6. Next value: 6.
Resource subscriber 6 completed.
```

The source code for this example can be found in

> destroy-old-instances.ts
