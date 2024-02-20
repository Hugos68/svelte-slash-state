# svelte-slash-state

Library aimed to fully replace the `svelte/store` module by providing a powerful `State` class.

This library will remain to be maintained until velte with provide a built in solution (which I expect to happen).

Credits to [Karim](https://github.com/karimfromjordan) for showcasing a startstopnotifier implementation using `$effect`, [here is the repl](https://svelte-5-preview.vercel.app/#H4sIAAAAAAAAA4VTy27bMBD8FUINYAp2bPXqWC5y7KlFm1tVBHosYyY0JZCUk0LQv3dJirLkOC10sPfJ2ZndLmJcgI62v7pI5keIttF900SryPxprKFPIAygretWldaz06XijdlnMjP82NTKkFJBbuARTVCEqfpIFuuNs9a-fv2sF3dYgCUCDNGH-pWk5EYbLKMsFxriSdj3SWdtqU3Ybc5vy53ICxAOxo7LpsU6hJxmUXmA8qWo37KIFFxWW2dDlXb22Z5sXIn9bxuOTWT3iTOHrHctK37ad36GUy5a6Hcb68K8DWc9EnKsK844VNHWKAyvRv6mg5-JfNZTEgficMAqLwSMpAXHhDeLDd5cegUsb4UhrJWl4bW8YIh0FrkC0yo5tqbJitC2qTAvJune56ByjFCLrGbkFUmyeqQpWbQS3-ASqkVMfKNBl8yUtdQ1IhP1E138fLj_8bCIZ0FDuDSgkC3UToP5OliUuoc9Blq2SoE0j45U618uZ654RT4nSXJuPcxDp-jfofn23YNxsTFHQK5GFAFcyOvdb29NVPxfgl6I8h9NO9zf8oX0g6a-xm__RzKOWnHJDc-FZ2JF8D6UGWS1hzFwFg5nlj09IN0W9lAKUBqzk7vRb-oGHbIVYsgeyB1ofQpvhF0Km3IDjEFp1jniPWF0Es7MEKQXCoXaCZjl0m1ZEs-z8Bo9MDcvZdL2CbMySf18E32temE9_Hd9Sfxn5aDx2hxAXsMYcN7ezmi7ijNg_bKmczizMQK_s1g_d_QX40ysSWgy5TCh4yJssFvgj_b3d_8XGbJbrNwFAAA=).

## Why?

### Shared state

To pass around state (context, props, functions, etc) you need to reference `$state` in a closure, `$state` by default only proxies objects meaning only objects will be allowed to be passed around. The `State` class adds a closure by adding the `value` property, this allows any primitive to also be passed around without losing the reference to the underlying `$state`.

### Start stop notifier

`svelte/store` has a powerful feature called the start stop notifier, learn more about it by reading through [the `svelte/store` docs](https://svelte.dev/docs/svelte-store), `$state` doesn't have any implementation simular to this, again the `State` class allows us to still use this powerful feature.

### Fine grained reactivity

`svelte/store` allows you to store big objects but those aren't fine grained, meaning when I update `$store.a`, `$store.b` also triggers as an update. The `State` class uses `$state` which uses a proxy on objects meaning we get fine grained reactivity.

### Verbosity

As you will see in the examples under [Replacing store](#replacing-stores), the `State` class allows for less and easier to reason about code to be written.

## Replacing stores

### Importing

```diff
- import { writable } from 'svelte/store';

+ import { State } from 'svelte-slash-state';
```

### Creating

```diff
- const store = writable();

+ const store = new State();
```

```diff
- const store = writable(0);

+ const store = new State(0);
```

```diff
- const store = writable(0, (set, update) => {
-    const interval = setInterval(() => {
-        update((value) => {
-           value++;
-           return value;
-        });
-    }, 1000);
-    return () => clearInterval(interval)
- });

+ const store = new State(0, (store) => {
+    const interval = setInteral(() => {
+        store.value++;
+    }, 1000);
+    return () => clearInterval(interval)
+ });
```

### Reading

```diff
- let value;
- store.subscribe((newValue) => (value = newValue));

+ store.value;
```

```diff
- $store;

+ store.value;
```

```diff
- get(store);

+ store.value;
```

### Writing

```diff
- store.set(5);

+ store.value = 5;
```

```diff
- store.update((value) => {
-     value++;
-     return value;
- });

+ store.value++;
```

## But where is X?

### Readable

`readable` is merely a wrapper around writable returning only the subscribe method, I don't think this adds any value to the library so I decided to leave this out, this can still easily be achieved if you wish to do so though:

```js
function readable(init, start) {
	const store = new State(init, start);
	return {
		get value() {
			return store.value;
		}
	};
}
```

### Derived

`derived` is a powerful function to derive a value from one or multiple stores. This function is not included because the `$derived` rune already solves this for us, for example:

```js
const storeA = new State(5);

const storeB = new State(10);

const sum = $derived(storeA.value + storeB.value);

console.log(sum); // 15

storeA.value++;

console.log(sum); // 16
```

### Get

`get` is a dirty way to grab a stores value outside a `.svelte` file by subscribing, grabbing the value and unsubscribing. This function is not included because with `$state` we can already grab the value without needing a subscription of any sort by simply accessing `store.value`

## But I don't like classes

For the people that really dislike classes there is also a `createState` function exported, it is identical to `new State`.
