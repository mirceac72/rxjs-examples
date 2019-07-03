---
id: creating-promises
title: Creating promises
---

## Creating promises

Promises are constructs used to manage asycnhronous operations which will succeed or fail at a further point in time. Usually, we are working with already created promises but from time to time it appears the need to create a promise ourselves.

Creating a promise is not so intuitive for the first time. The `Promise` constructor should get one parameter, a function which has two arguments. These two arguments are functions on their own and are usually named `resolve` and `reject`.

```typescript
const promise = new Promise((resolve, reject) => {...})
```

The `Promise` constructor will call the function provided by argument and will suply the values values for `resolve` and `reject`. The client code at its turn will use the provided `resolve` and `reject` functions at a later moment to indicate the success or the failure of an operation.

```typescript
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
    resolveCallback(40);
}
```
The above code sequence shows that calling `resolveCallback(40)` at a later time will trigger display of the `40` value in console.

An important thing to keep in mind is that there are more types of promises, not only the `Promise` object from ECMAScript 2015. Another popular variant of promises are the `JQueryPromise` objects, introduced by the `JQuery` library.

Creating `JQueryPromise` objects is somehow easier. First, we create a deferred object.

```typescript
const deferred = jQuery.Deferred();
```

JQuery `Deferred` objects have methods like `resolve` and `reject`, which allow to indicate if a value for promise was succesfully obtained or a failure occured. They also have the `promise` method to create a `JQueryPromise`.

```typescript
const jQueryPromise = deferred.promise();
```

Sometimes, `Promises` and `JQueryPromises` can be used interchageably. For example, the call
`displayProvidedValue(jQueryPromise);` will work as well. But this is not always true. The next method will display a message when the promise is completed either with a value or with an error.

```typescript
function tellWhenDone(promise: Promise<any>, message: string): void {
    promise.finally(() => {
        console.log(message);
    })
}

tellWhenDone(promise, `Promise object completed`);
```

However, the call `tellWhenDone(jQueryPromise, ``JQueryPromise object completed``)` will not work and that because the `JQueryPromise` objects do not a have a method `finally`, they have a similar method called `always`.

One solution is to extend `jQueryPromise` with a `finally` method which acts like a proxy for the `always` method.

```typescript
function extendJQueryPromise(promise: any): void {
    promise.finally = (callback: any) => {
            promise.always(() => {
                callback();
            });
        }
}

extendJQueryPromise(jQueryPromise);
```

After extending the `jQueryPromise` object, the call
```typescript
tellWhenDone(jQueryPromise, `JQueryPromise object completed`);
```
will work as well.

`JQueryPromise` are not the only type of promise to exist beside the Javascript native `Promise` objects. There are other popular promise libraries like [Bluebird promise library](http://http://bluebirdjs.com/docs/getting-started.html) or [Q promise library](https://github.com/kriskowal/q). The good news is that the promises provided by these libraries are compatible most of the time with the Javascript _standard_ promise. If you got an error that a method is missing or have an incopatible signature while using a promise the it worths to check what type of promise is it.
