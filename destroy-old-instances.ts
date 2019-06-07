import { BehaviorSubject, Observable, of } from "rxjs";
import { map, scan, endWith, filter } from "rxjs/operators";
import { createSubscriber } from "./subscriber";

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

const flowOfElements$ = createElementFlow(1, 2);

function consumeElements(elements$: Observable<ElementWithResources>) {
    elements$.subscribe(element => {
        element.flow$.subscribe(createSubscriber(`Resource subscriber ${element.id}`));
    });
}

consumeElements(flowOfElements$);

const flowWhichClearResources$ = createElementFlow(3, 4).pipe(
    scan((old: ElementWithResources, current: ElementWithResources) => {
        if (old) {
            old.destroy();
        }
        return current;
    })
);

consumeElements(flowWhichClearResources$);

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

consumeElements(flowWhichClearAllResources$);
