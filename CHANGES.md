# Changelog

## 2.0.0

- `FunctionCall.call` renamed `Function.start`.
- `backoff.call` no longer invokes the wrapped function on `nextTick`.

## 1.2.1

- Make `FunctionCall.backoffFactory` a private member.

## 1.2.0

- Add `backoff.call` and the associated `FunctionCall` class.

## 1.1.0

- Add a `Backoff.failAfter`.

## 1.0.0

- Rename `start` and `done` events `backoff` and `ready`.
- Remove deprecated `backoff.fibonnaci`.

## 0.2.1

- Create `backoff.fibonacci`.
- Deprecate `backoff.fibonnaci`.
- Expose fibonacci and exponential strategies.

## 0.2.0

- Provide exponential and fibonacci backoffs.

## 0.1.0

- Change `initialTimeout` and `maxTimeout` to `initialDelay` and `maxDelay`.
- Use fibonnaci backoff.
