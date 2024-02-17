export type Empty = null | undefined;

export type HTMLParams = Record<string, unknown>;

export type Sub = {
    fn: () => void
};

export type State<T> = {
    val: T,
    subs: Sub[]
};

export type Signal<T> = <U extends T[]>(...args: U) => U extends [] ? T : void;
export type ReadonlySignal<T> = () => T;

export type ElementFn = () => HTMLElement;
export type CommonParams = ElementFn | string | number;
export type CommonValues = HTMLElement | string;
export type HTMLFn = (params: HTMLParams, ...children: CommonParams[]) => HTMLElement;
