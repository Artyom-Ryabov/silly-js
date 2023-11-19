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
 * @template T
 * @param {() => void} fn
 * @param {State<T>[]} deps
 */
function $effect(fn, ...deps) {
    deps.forEach(dep => dep.$sub(fn));
}

/**
 * @template T
 * @param {() => T} fn
 * @param {State<unknown>[]} deps
 * @returns {ReadonlyState<T>}
 */
function $computed(fn, ...deps) {
    const state = $state(fn());
    $effect(() => state.$set(fn()), ...deps);
    return state;
}

/**
 * @typedef {() => HTMLElement} ElementFn
 */

/**
 * @param {(
 *  unknown[]
 *  |ElementFn
 *  |StateObject
 *  |string
 *  |number
 *  |Empty
 * )} element
 * @returns {HTMLElement|string|number}
 */
function* getElement(element) {
    switch (true) {
        case Array.isArray(element):
            yield* getElements(element);
            break;
        case typeof element === 'function':
            yield element();
            break;
        case typeof element.$get === 'function':
            const value = element.$get();
            if (Array.isArray(value)) {
                yield* getElements(value);
                break;
            }
            yield value;
            break;
        default:
            yield element;
    }
}

/**
 * @param {(
 *  unknown[]
 *  |ElementFn
 *  |StateObject
 *  |string
 *  |number
 *  |Empty
 * )[]} elements
 * @returns {HTMLElement|string|number}
 */
function* getElements(elements) {
    for (const element of elements) {
        yield* getElement(element);
    }
}

/**
 * @param {HTMLTag} element
 * @param {HTMLParams} params
 * @param {(
 *  unknown[]
 *  |ElementFn
 *  |StateObject
 *  |string
 *  |number
 *  |Empty
 * )[]} children
 * @returns {ElementFn}
 */
function $node(element, params, ...children) {
    /** @type {HTMLElement} */
    const el = document.createElement(element);

    for (const key in params) {
        if (typeof params[key] === 'function') {
            el.addEventListener(key, params[key]);
        } else {
            el[key] = params[key];
        }
    }
    children = children.filter(Boolean);
    if (children.length > 0) {
        const update = () => {
            el.innerHTML = '';
            for (const child of getElements(children)) el.append(child);
        };
        if (children.some(c => c instanceof StateObject)) {
            children.filter(c => c instanceof StateObject).forEach(state => state.$sub(update));
        }
        update();
    }
    return () => el;
}

/**
 * @param {State<boolean>} condition
 * @param {(
 *  unknown[]
 *  |ElementFn
 *  |StateObject
 *  |string
 *  |number
 *  |Empty
 * )} left
 * @param {(
 *  unknown[]
 *  |ElementFn
 *  |StateObject
 *  |string
 *  |number
 *  |Empty
 * )} right
 * @returns {ReadonlyState<HTMLElement|string|number>}
 */
function $if(condition, left, right) {
    const callback = () => {
        const content = [];
        for (const el of getElement(condition.$get() ? left : right)) content.push(el);
        return content;
    };
    return $computed(callback, condition);
}

/**
 * @template T
 * @param {() => void} fn
 * @param {State<T>[]} deps
 */
function $for(fn, deps) {
    return $computed(fn, deps);
}

function bootstrap(app) {
    document.querySelector('body').append(typeof app === 'function' ? app() : app);
}

const _ = undefined;

const $ = {
    div: (params, ...children) => $node('div', params, ...children),
    h1: (params, ...children) => $node('h1', params, ...children),
    input: (params, ...children) => $node('input', params, ...children),
    button: (params, ...children) => $node('button', params, ...children),
    span: (params, ...children) => $node('span', params, ...children),
    s: (params, ...children) => $node('s', params, ...children),
    p: (params, ...children) => $node('p', params, ...children),
    img: (params, ...children) => $node('img', params, ...children),
    select: (params, ...children) => $node('select', params, ...children)
};
