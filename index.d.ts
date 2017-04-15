import {EventEmitter} from "events";

export interface BackoffStrategyOptions {
    initialDelay?: number;
    maxDelay?: number;
    randomisationFactor?: number
}

abstract class BackoffStrategy {
    constructor(options?: BackoffStrategyOptions)

    getMaxDelay(): number;

    getInitialDelay(): number;

    next();

    reset();
}

export class FibonacciStrategy extends BackoffStrategy {

}

export interface ExponentialStrategyOptions extends BackoffStrategyOptions {
    factor?: number
}

export class ExponentialStrategy extends BackoffStrategy {
    constructor(options?: ExponentialStrategyOptions);

    public static DEFAULT_FACTOR: number;
}

export class Backoff extends EventEmitter {
    constructor(backoffStrategy: BackoffStrategy);

    failAfter(maxNumberOfRetry: number);

    backoff(err?: Error);

    reset();
}


export class FunctionCall extends EventEmitter {

    constructor(fn: Function, args: any[], callback: Function);

    isPending(): boolean;

    isRunning(): boolean;

    isCompleted(): boolean;

    isAborted(): boolean;

    setStrategy(strategy: BackoffStrategy): this;

    retryIf(retryPredicate: (err: Error) => boolean): this;

    getLastResult(): any;

    getNumRetries(): number;

    failAfter(maxNumberOfRetry: number): this;

    abort();

    start(backoffFactory?: (strategy: BackoffStrategy) => Backoff);
}

export function fibonacci(options?: BackoffStrategyOptions): Backoff;

export function exponential(options?: ExponentialStrategyOptions): Backoff;

// Have to be done that way until this gets solved https://github.com/Microsoft/TypeScript/issues/1360
export function call(fn: Function, arg1: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, callback: Function): FunctionCall;
export function call(fn: Function, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, arg10: any, callback: Function): FunctionCall;