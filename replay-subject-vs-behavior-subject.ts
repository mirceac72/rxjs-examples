import { ReplaySubject, BehaviorSubject } from "rxjs";
import { createSubscriber } from "./subscriber";

const replay$ = new ReplaySubject<boolean>();
const behavior$ = new BehaviorSubject<boolean>(true);

replay$.subscribe(createSubscriber('Replay initial subscriber'));
behavior$.subscribe(createSubscriber('Behavior initial subscriber'));

replay$.next(true);

replay$.complete();
behavior$.complete();

replay$.subscribe(createSubscriber('Replay late subscriber'));
behavior$.subscribe(createSubscriber('Behavior late subscriber'));
