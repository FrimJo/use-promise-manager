import * as React from "react";
import { useMachine } from "@xstate/react";
import { Machine, StateSchema, assign } from "xstate";

interface IContext {
  error: any[];
  count: number;
}

interface IStateSchema extends StateSchema<IContext> {
  states: {
    idle: {};
    pending: {};
  };
}

type Event =
  | { type: "INIT" }
  | { type: "RESOLVE" }
  | { type: "REJECT"; error: IContext["error"][number] };

const ManagePromiseMachine = Machine<IContext, IStateSchema, Event>({
  id: "managePromise",
  initial: "idle",
  context: {
    error: [],
    count: 0
  },
  states: {
    idle: {
      on: {
        INIT: {
          target: "pending",
          actions: assign({
            error: (_context, _event) => [],
            count: (_context, _event) => 1
          })
        }
      }
    },
    pending: {
      on: {
        "": {
          cond: (context, _event) => context.count === 0,
          target: "idle"
        },
        INIT: {
          actions: assign({
            count: (context, _event) => context.count + 1
          })
        },
        RESOLVE: {
          actions: assign({
            count: (context, _event) => context.count - 1
          })
        },
        REJECT: {
          actions: assign({
            error: (context, event) => context.error.concat(event.error),
            count: (context, _event) => context.count - 1
          })
        }
      }
    }
  }
});

type PromiseState = Readonly<{
  hasError: boolean;
  isResolving: boolean;
  error: IContext["error"];
}>;

type ManagePromiseFunction = <T>(promise: Promise<T>) => Promise<T>;

export const usePromiseManager = (): [PromiseState, ManagePromiseFunction] => {
  const [current, send] = useMachine(ManagePromiseMachine);
  const { error } = current.context;

  const state = React.useMemo(
    () => ({
      hasError: error.length > 0,
      isResolving: current.matches("pending"),
      error
    }),
    [error, current]
  );

  const manage: ManagePromiseFunction = React.useCallback(
    async promise => {
      send({ type: "INIT" });
      return promise
        .then(result => {
          send({ type: "RESOLVE" });
          return result;
        })
        .catch(error => {
          send({ type: "REJECT", error });
          return error;
        });
    },
    [send]
  );

  return [state, manage];
};
