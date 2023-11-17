/**
 * @typedef {null|undefined} Empty
 * @typedef {'div'|'input'|'button'|'span'|'h1'|'p'} HTMLTag
 * @typedef {'class'|'type'|'data-'|'title'|'name'|'src'|'checked'|'disabled'|'alt'|'width'|'value'|'height'|'size'} HTMLAttribute
 */

/**
 * @template T
 * @typedef {Object} State
 * @property {() => T} $get
 * @property {(v: T) => void} $set
 */

/**
 * @template T
 * @typedef {Object} ReadonlyState
 * @property {() => T} $get
 */

class StateObject {
    #subscribers = [];
    #value;

    constructor(value) {
        this.#value = value;
    }

    $get() {
        return this.#value;
    }

    $set(value) {
        this.#value = value;
        this.$notify();
    }

    $sub(fn) {
        if (typeof fn !== 'function') return;
        this.#subscribers.push(fn);
    }

    $notify() {
        this.#subscribers.forEach(fn => fn());
    }
}

/**
 * @template T
 * @param {T} value
 * @returns {State<T>}
 */
function $state(value) {
    return new StateObject(value);
}

/**
 * @param {() => void} fn
 * @param {(StateObject|Empty)[]} deps
 */
function $effect(fn, ...deps) {
    deps.filter(Boolean).forEach(dep => dep.$sub(fn));
}

/**
 * @template T
 * @param {() => void} fn
 * @param {(StateObject|Empty)[]} deps
 * @returns {ReadonlyState<T>}
 */
function $computed(fn, ...deps) {
    const state = $state(fn());
    $effect(() => state.$set(fn()), ...deps);
    return state;
}

/**
 * @param {HTMLTag} element
 * @param {HTMLParams} params
 * @param {(HTMLElement|Empty)[]=} children
 * @returns {() => HTMLElement}
 */
function $node(element, params, ...children) {
    /** @type {HTMLElement} */
    const el = document.createElement(element);

    for (const key in params) {
        if (typeof params[key] === 'function') {
            el.addEventListener(key, params[key]);
        } else {
            el[key] = params[key];
            // el.setAttribute(key, params[key]);
        }
    }
    let update = () => void 0;
    if (Array.isArray(children)) {
        children = children.filter(Boolean);
        update = () => {
            el.innerHTML = '';
            children
                .reduce((acc, child) => {
                    if (Array.isArray(child)) {
                        acc.push(...child);
                        return acc;
                    }
                    acc.push(child);
                    return acc;
                }, [])
                .map(child => {
                    if (typeof child.$get === 'function') {
                        const value = child.$get();
                        if (Array.isArray(value)) {
                            return value.map(fn => fn());
                        }
                        return value;
                    }
                    if (typeof child === 'function') {
                        return child();
                    }
                    return child;
                })
                .reduce((acc, child) => {
                    if (Array.isArray(child)) {
                        acc.push(...child);
                        return acc;
                    }
                    acc.push(child);
                    return acc;
                }, [])
                .forEach(c => el.append(c));
        };
        if (children.some(c => c instanceof StateObject)) {
            children.filter(c => c instanceof StateObject).forEach(state => state.$sub(update));
        }
    }
    return () => {
        update();
        return el;
    };
}

function $if(condition, left, right) {
    return $computed(() => (condition.$get() ? left() : right()), condition);
}

function $for(fn, deps) {
    return $computed(fn, deps);
}

const $ = {
    div: (params, ...children) => $node('div', params, ...children),
    h1: (params, ...children) => $node('h1', params, ...children),
    input: (params, ...children) => $node('input', params, ...children),
    button: (params, ...children) => $node('button', params, ...children),
    span: (params, ...children) => $node('span', params, ...children),
    s: (params, ...children) => $node('s', params, ...children),
    p: (params, ...children) => $node('p', params, ...children),
};

function bootstrap(app) {
    document.querySelector('body').append(typeof app === 'function' ? app() : app);
}

const _ = undefined;

function Counter() {
    const counter = $state(0);
    $effect(() => console.log(counter.$get()), counter);
    const doubled = $computed(() => counter.$get() * 2, counter);
    const isEven = $computed(() => counter.$get() % 2 == 0, counter);

    const count = () => counter.$set(counter.$get() + 1);

    return $.div(
        {
            style: 'display: flex; flex-direction: column; gap: 5px; width: 150px'
        },
        $.span(null, counter),
        $.span(null, doubled),
        $.button({ click: count }, 'count'),
        $if(isEven, $.span(null, 'lol'), $.span(null, 'bruh'))
    );
}

const text = $state('');

// const root = $.div(
//     null,
//     $.div(null, Counter(), Counter()),
//     $.div(
//         null,
//         $.input({ value: text.$get(), input: e => text.$set(e.target.value) }),
//         $.div(null, text)
//     )
// )();

// bootstrap(root);
