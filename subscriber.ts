class Subscriber {
    constructor(private name: string) {}
    next = (x: any) => { console.log(`${this.name}. Next value: ${x}.`); };
    error = (x: any) => { console.log(`${this.name}. Error: ${x}.`); };
    complete = () => { console.log(`${this.name} completed.`); }
}

export const createSubscriber = (name: string) => new Subscriber(name);