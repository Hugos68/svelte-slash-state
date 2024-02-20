import { describe, it, expect } from 'vitest';
import { State, createState } from '../src/lib';
import { tick } from 'svelte';

function getState<T>(
	strategy: 'class based' | 'functional',
	init?: ConstructorParameters<typeof State<T>>[0],
	start?: ConstructorParameters<typeof State<T>>[1]
) {
	switch (strategy) {
		case 'class based':
			return new State(init, start);
		case 'functional':
			return createState(init, start);
		default:
			throw new Error('Invalid strategy');
	}
}

for (const strategy of ['class based', 'functional'] as const) {
	describe(`${strategy} state`, () => {
		it('can be created', () => {
			const classState = getState(strategy);

			expect(classState).toBeDefined();
			expect(classState).toHaveProperty('value');
		});
		it('can get its value', () => {
			const store = getState(strategy, 0);

			expect(store.value).toBe(0);
		});
		it('can set its value', () => {
			const store = getState(strategy, 0);

			store.value = 1;

			expect(store.value).toBe(1);
		});

		it('can update its value', () => {
			const store = getState(strategy, 0);

			store.value = store.value + 1;

			expect(store.value).toBe(1);
		});
		describe('start stop notifier', () => {
			it('starts when the value is referenced in an effect', async () => {
				let started = false;

				const store = getState(strategy, 0, () => {
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

				const store = getState(strategy, 0, () => {
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
					const store = getState(strategy, 0, () => {
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
				const store = getState(strategy, 0, (store) => {
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
}
