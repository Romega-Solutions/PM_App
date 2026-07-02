import type { StateCreator } from "zustand";

type StorageValue<T> = {
  state: Partial<T>;
  version?: number;
};

type StringStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

type JsonStorage<T> = {
  getItem: (key: string) => Promise<StorageValue<T> | null>;
  setItem: (key: string, value: StorageValue<T>) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type PersistOptions<T> = {
  name: string;
  storage: JsonStorage<T>;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: () => ((state?: T, error?: unknown) => void) | void;
};

const noop = () => {};

export function createJSONStorage<T>(getStorage: () => StringStorage): JsonStorage<T> {
  return {
    getItem: async (key) => {
      const value = await getStorage().getItem(key);
      return value ? (JSON.parse(value) as StorageValue<T>) : null;
    },
    setItem: async (key, value) => {
      await getStorage().setItem(key, JSON.stringify(value));
    },
    removeItem: async (key) => {
      await getStorage().removeItem(key);
    },
  };
}

export function persist<T>(
  initializer: StateCreator<T, [], [], T>,
  options: PersistOptions<T>,
): StateCreator<T, [], [], T> {
  return (set, get, api) => {
    const save = async () => {
      const state = get() as T;
      const persistedState = options.partialize ? options.partialize(state) : state;
      await options.storage.setItem(options.name, {
        state: persistedState,
        version: 0,
      });
    };

    const persistSet = ((partial: unknown, replace?: boolean) => {
      (set as (partial: unknown, replace?: boolean) => void)(partial, replace);
      void save().catch(noop);
    }) as typeof set;

    const initialState = initializer(persistSet, get, api);
    const afterRehydrate = options.onRehydrateStorage?.();

    queueMicrotask(async () => {
      try {
        const persisted = await options.storage.getItem(options.name);

        if (persisted?.state) {
          set(persisted.state);
        }

        afterRehydrate?.(get(), undefined);
      } catch (error) {
        afterRehydrate?.(undefined, error);
      }
    });

    return initialState;
  };
}
