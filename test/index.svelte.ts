import { describe, it, expect } from 'vitest';
import { State } from '../src/lib';
import { tick } from 'svelte';

describe('store', () => {
	it('can be created', () => {
		const store = new State();

		expect(store).toBeDefined();
		expect(store).toHaveProperty('value');
	});
	it('can get its value', () => {
		const store = new State(0);

		expect(store.value).toBe(0);
	});
	it('can set its value', () => {
		const store = new State(0);

		store.value = 1;

		expect(store.value).toBe(1);
	});

	it('can update its value', () => {
		const store = new State(0);

		store.value = store.value + 1;

		expect(store.value).toBe(1);
	});
	describe('start stop notifier', () => {
		it('starts when the value is referenced in an effect', async () => {
			let started = false;

			const store = new State(0, () => {
				started = true;
			});

			const cleanup = $effect.root(() => {
				$effect(() => {
					store.value;
				});
			});

			await tick();

			expect(started).toBeTruthy();

			cleanup();
		});
		it('stops when the value is no longer referenced in an effect', async () => {
			let stopped = false;

			const store = new State(0, () => {
				return () => {
					stopped = true;
				};
			});

			const cleanup = $effect.root(() => {
				$effect(() => {
					store.value;
				});
			});

			await tick();

			expect(stopped).toBeFalsy();

			cleanup();

			await tick();

			expect(stopped).toBeTruthy();
		});
		it('only starts once when the value is referenced in multiple effects', async () => {
			let startAmount = 0;

			const cleanup = $effect.root(() => {
				const store = new State(0, () => {
					startAmount++;
					return () => {
						startAmount--;
					};
				});
				$effect(() => {
					store.value;
				});
				$effect(() => {
					store.value;
				});
			});

			await tick();

			expect(startAmount).toBe(1);

			cleanup();

			await tick();

			expect(startAmount).toBe(0);
		});
		it('passes a writable reference of the store to the start function', async () => {
			const store = new State(0, (store) => {
				store.value = 1;
			});

			const cleanup = $effect.root(() => {
				$effect(() => {
					store.value;
				});
			});

			await tick();

			expect(store.value).toBe(1);

			cleanup();
		});
	});
});
