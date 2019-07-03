
/**
 * Package that provides support to create JQuery like
 * deferred objects in NodeJS.
 */
var jQuery = require('jquery-deferred');
/**
 * These variables will hold the resolve and reject callbacks
 * provided by the Promise constructor.
 */
let resolveCallback: (value: number) => void = () => {};
let rejectCallback: (error: any) => void = () => {};

const promise = new Promise<number>((resolve, reject) => {
    resolveCallback = resolve;
    rejectCallback = reject;
});

function displayProvidedValue<T>(promise: Promise<T>) {
    promise.then((value) => {
        console.log(value)
    });
}

displayProvidedValue(promise);

if (resolveCallback) {
    // That makes promise to be resolved.
    resolveCallback(40);
}

const deferred = jQuery.Deferred();
const jQueryPromise = deferred.promise();

displayProvidedValue(jQueryPromise);

deferred.resolve(23);

function tellWhenDone(promise: Promise<any>, message: string): void {
    promise.finally(() => {
        console.log(message);
    })
}

const errorRaisingPromise = new Promise<number>((resolve, reject) => {
    resolveCallback = resolve;
    rejectCallback = reject;
});

tellWhenDone(promise, `Promise object completed`);

// The below code will fail if uncommented
// tellWhenDone(promise, `Promise object completed`);

function extendJQueryPromise(promise: any): void {
    promise.finally = (callback: any) => {
            promise.always(() => {
                callback();
            });
        }
}

extendJQueryPromise(jQueryPromise);
tellWhenDone(jQueryPromise, `JQueryPromise object completed`);
