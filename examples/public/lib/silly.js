// @ts-check
(function(global, doc) {
    /**
     * @typedef {import('./types.d.ts').HTMLParams} HTMLParams
     * @typedef {import('./types.d.ts').CommonParams} CommonParams
     * @typedef {import('./types.d.ts').CommonValues} CommonValues
     * @typedef {import('./types.d.ts').ElementFn} ElementFn
     * @typedef {import('./types.d.ts').HTMLFn} HTMLFn
     */
    /**
     * @template T
     * @typedef {import('./types.d.ts').State<T>} State
     */
    /**
     * @template T
     * @typedef {import('./types.d.ts').Signal<T>} Signal
     */
    /**
     * @template T
     * @typedef {import('./types.d.ts').ReadonlySignal<T>} ReadonlySignal
     */

    /**
     * @param {() => void} fn 
     */
    function Sub(fn) {
        this.fn = fn;
    }

    /**
     * @template T
     * @param {T} value
     * @returns {Signal<T>}
     */
    function $state(value) {
        /** @type {State<T>} */
        var state = {
            val: value,
            subs: []
        };
        // @ts-ignore
        return function(...args) {
            if (args.length === 0) {
                return state.val;
            }
            if (args.length > 1) {
                throw new Error('Signal accepts only 1 argument');
            }
            var val = args[0];
            if (val instanceof Sub) {
                state.subs.push(val);
                return;
            }
            state.val = val;
            state.subs.forEach(sub => sub.fn());
        };
    }

    /**
     * @param {() => void} fn
     * @param {(Signal<unknown>|ReadonlySignal<unknown>)[]} deps
     */
    function $effect(fn, deps) {
        deps.forEach(dep => dep(new Sub(fn)));
    }

    /**
     * @template T
     * @param {() => T} fn
     * @param {(Signal<unknown>|ReadonlySignal<unknown>)[]} deps
     * @returns {ReadonlySignal<T>}
     */
    function $computed(fn, deps) {
        var state = $state(fn());
        $effect(() => state(fn()), deps);
        return state;
    }

    /**
     * @param {CommonParams|unknown} element 
     */
    function* getElement(element) {
        switch (true) {
            case Array.isArray(element):
                yield* getElements(element);
                break;
            case typeof element === 'function':
                var value = element();
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
     * @param {(CommonParams|unknown)[]} elements
     */
    function* getElements(elements) {
        for (let element of elements) {
            yield* getElement(element);
        }
    }

    /**
     * @param {string} element
     * @param {HTMLParams} params
     * @param {CommonParams[]} children
     * @returns {HTMLElement}
     */
    function $node(element, params, ...children) {
        var el = doc.createElement(element);
        for (var key in params) el[key] = params[key];
        children = children.filter(Boolean);
        if (children.length > 0) {
            var update = new Sub(() => {
                el.innerHTML = '';
                for (var child of getElements(children)) el.append(child);
            });
            if (children.some(c => typeof c === 'function')) {
                children
                    .filter(c => typeof c === 'function')
                    // @ts-ignore
                    .forEach(signal => signal(update));
            }
            update.fn();
        }
        return el;
    }

    /**
     * @param {Signal<boolean>} condition
     * @param {CommonParams} left
     * @param {CommonParams} right
     * @returns {ReadonlySignal<CommonValues[]>}
     */
    function $if(condition, left, right) {
        var callback = () => {
            /** @type {CommonValues[]} */
            var content = [];
            for (let el of getElement(condition() ? left : right)) content.push(el);
            return content;
        };
        return $computed(callback, [condition]);
    }

    /**
     * @param {() => CommonValues[]} fn
     * @param {(Signal<unknown>|ReadonlySignal<unknown>)[]} deps
     * @returns {ReadonlySignal<CommonValues[]>}
     */
    function $for(fn, deps) {
        return $computed(fn, deps);
    }

    /**
     * @param {ElementFn|CommonValues} app 
     */
    function bootstrap(app) {
        doc.querySelector('body')?.append(typeof app === 'function' ? app() : app);
    }

    var _ = undefined;

    var $ = {
        /** @type {HTMLFn} */
        div: (params, ...children) => $node('div', params, ...children),
        /** @type {HTMLFn} */
        h1: (params, ...children) => $node('h1', params, ...children),
        /** @type {HTMLFn} */
        input: (params, ...children) => $node('input', params, ...children),
        /** @type {HTMLFn} */
        button: (params, ...children) => $node('button', params, ...children),
        /** @type {HTMLFn} */
        span: (params, ...children) => $node('span', params, ...children),
        /** @type {HTMLFn} */
        s: (params, ...children) => $node('s', params, ...children),
        /** @type {HTMLFn} */
        p: (params, ...children) => $node('p', params, ...children),
        /** @type {HTMLFn} */
        img: (params, ...children) => $node('img', params, ...children),
        /** @type {HTMLFn} */
        select: (params, ...children) => $node('select', params, ...children)
    };

    global.bootstrap = bootstrap;
    global.$state = $state;
    global.$effect = $effect;
    global.$computed = $computed;
    global.$if = $if;
    global.$for = $for;
    global.$ = $;
    global._ = _;
    global.$node = $node;
})(globalThis, globalThis.document)
