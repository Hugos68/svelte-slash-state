import { tick } from 'svelte';

export type StartStopNotifier<T> = (state: { value: T }) => (() => void) | void;

export type State<T> = {
	get value(): T;
	set value(new_value: T);
};

export function createState<T>(init: T, start?: StartStopNotifier<T>): State<T>;
export function createState<T>(): State<T | undefined>;
export function createState<T>(
	init?: T,
	start?: StartStopNotifier<T | undefined>
): State<T | undefined> {
	let value = $state(init);
	let stop: (() => void) | void | null = null;
	let subscribers = 0;
	return {
		get value() {
			if (start && $effect.active()) {
				$effect(() => {
					if (++subscribers === 1) {
						stop = start(this);
					}
					return () => {
						tick().then(() => {
							if (--subscribers === 0) {
								stop?.();
								stop = null;
							}
						});
					};
				});
			}
			return value;
		},
		set value(new_value) {
			value = new_value;
		}
	};
}
