import { tick } from 'svelte';

export type StartStopNotifier<T> = (state: { value: T }) => (() => void) | void;

export class State<T> {
	private internal_value = $state() as T;
	private start: StartStopNotifier<T>;
	private stop: ReturnType<StartStopNotifier<T>> | null;
	private subscriber_count: number;

	constructor(init?: T, start: StartStopNotifier<T> = () => {}) {
		this.internal_value = init as T;
		this.start = start;
		this.stop = null;
		this.subscriber_count = 0;
	}

	public get value() {
		if ($effect.active()) {
			$effect(() => {
				if (++this.subscriber_count === 1) {
					this.stop = this.start(this);
				}
				return () => {
					tick().then(() => {
						if (--this.subscriber_count === 0) {
							this.stop?.();
							this.stop = null;
						}
					});
				};
			});
		}
		return this.internal_value;
	}

	public set value(new_value: T) {
		this.internal_value = new_value;
	}
}
