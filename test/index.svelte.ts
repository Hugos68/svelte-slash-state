import { describe, it, expect } from 'vitest';
import { state } from '../src/lib';

describe('state', () => {
	it('can be created', () => {
		const store = state();

		expect(store).toBeDefined();
		expect(store).toHaveProperty('value');
	});
	it('can get a value', () => {
		const store = state(0);

		expect(store.value).toBe(0);
	});
	it('can set a value', () => {
		const store = state(0);

		store.value = 1;

		expect(store.value).toBe(1);
	});
});
