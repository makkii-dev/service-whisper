/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class Deferred<T> implements Promise<T> {
    readonly [Symbol.toStringTag]: "Promise";
    promise: Promise<T>;
    resolve: (value?: T) => void = () => {};
    reject: (reason?: T) => void = () => {};

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?:
            | ((value: T) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>)
            | null
            | undefined
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }
    catch<TResult = never>(
        onrejected?:
            | ((reason: any) => TResult | PromiseLike<TResult>)
            | null
            | undefined
    ): Promise<T | TResult> {
        return this.promise.catch(onrejected);
    }
    finally(onfinally?: (() => void) | null | undefined): Promise<T> {
        return this.promise.finally(onfinally);
    }
}

class BaseConnector {
    socket: SocketIOClientStatic["Socket"];
    channel: string | undefined;
    prefix: string | undefined;

    constructor(opts: {
        prefix: string;
        socket: SocketIOClientStatic["Socket"];
        channel?: string;
    }) {
        this.socket = opts.socket;
        this.channel = opts.channel;
        this.prefix = opts.prefix;
    }

    getSessionStatus = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (this.socket.disconnected) {
                reject("connect colsed");
            } else {
                const listener = (payload: {
                    connect: boolean;
                    buyer: any;
                    seller: any;
                }): void => {
                    const { connect, ...rest } = payload;
                    if (connect) {
                        resolve(rest);
                    } else {
                        reject("session not open or be closed");
                    }
                };
                this.socket.removeEventListener("session");
                this.socket.addEventListener("session", listener);
                this.socket.emit("session", {});
            }
        });
    };

    setChannel = (channel_: string): void => {
        this.channel = channel_;
    };

    sendMsg = (msg: string): void => {
        console.log(this.prefix + "[send]=>" + msg);
        this.socket.emit("say" + this.channel!, msg);
    };

    listener = (msg: any): void => {
        console.log(this.prefix + "[recv]<=" + msg);
    };

    init = (): void => {
        // try to remove last listener
        this.socket.removeListener("say" + this.channel!, this.listener);

        // add new listener
        this.socket.addEventListener("say" + this.channel!, this.listener);
    };
}

export default BaseConnector;
