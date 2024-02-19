import { describe, it, expect } from 'vitest';
import { createState } from '../src/lib';
import { tick } from 'svelte';

describe('state', () => {
	it('can be created', () => {
		const store = createState();

		expect(store).toBeDefined();
		expect(store).toHaveProperty('value');
	});
	it('can get a value', () => {
		const store = createState(0);

		expect(store.value).toBe(0);
	});
	it('can set a value', () => {
		const store = createState(0);

		store.value = 1;

		expect(store.value).toBe(1);
	});
	describe('start stop notifier', () => {
		it('starts when the value is referenced in an effect', async () => {
			let started = false;

			const store = createState(0, () => {
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

			const store = createState(0, () => {
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
				const store = createState(0, () => {
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
	});
});
