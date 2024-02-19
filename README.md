# svelte-slash-state

Library aimed to fully replace the `svelte/store` module by providing a powerful `createState` function.

## Replacing stores

### Importing

```diff
- import { writable } from 'svelte/store';

+ import { createState } from 'svelte-slash-state';
```

### Creating

```diff
- const store = writable();

+ const store = createState();
```

```diff
- const store = writable(0);

+ const store = createState(0);
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

+ const store = createState(0, (store) => {
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
	const store = createState(init, start);
	return {
		get value() {
			return store.value;
		}
	};
}
```

### Derived

`derived` is a powerful function to derive a value from one or multiple stores. This function is not included because the $derived rune already solves this for us, for example:

```js
const storeA = createState(5);

const storeB = createState(10);

const sum = $derived(storeA.value + storeB.value);

console.log(sum); // 15

storeA.value++;

console.log(sum); // 16
```

### Get

`get` is a dirty way to grab a stores value outside a `.svelte` file by subscribing, grabbing the value and unsubscribing. This function is not included because with `$state` we can already grab the value without needing a subscription of any sort by simply accessing `store.value`
