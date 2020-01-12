import * as React from "react";

interface IState {
  error: any[];
  count: number;
}

type Actions =
  | { type: "INIT" }
  | { type: "RESOLVE" }
  | { type: "REJECT"; error: IState["error"][number] };

type PromiseState = Readonly<{
  hasError: boolean;
  isResolving: boolean;
  error: IState["error"];
}>;

type ManagePromiseFunction = <T>(promise: Promise<T>) => Promise<T>;

const promiseManagerReducer: React.Reducer<IState, Actions> = (
  prervState,
  action
) => {
  switch (action.type) {
    case "INIT": {
      const count = prervState.count === 0 ? 1 : prervState.count + 1;
      const error = prervState.count === 0 ? [] : prervState.error;
      return { ...prervState, count, error };
    }
    case "REJECT": {
      const count = prervState.count - 1;
      const error = [...prervState.error, action.error];
      return { ...prervState, count, error };
    }
    case "RESOLVE": {
      const count = prervState.count - 1;
      return { ...prervState, count };
    }
  }
};

export const usePromiseManager = (): [PromiseState, ManagePromiseFunction] => {
  const [state, dispatch] = React.useReducer(promiseManagerReducer, {
    error: [],
    count: 0
  });

  const manage: ManagePromiseFunction = React.useCallback(
    async promise => {
      dispatch({ type: "INIT" });
      return promise
        .then(result => {
          dispatch({ type: "RESOLVE" });
          return result;
        })
        .catch(error => {
          dispatch({ type: "REJECT", error });
          return error;
        });
    },
    [dispatch]
  );

  return [
    React.useMemo(
      () => ({
        hasError: state.error.length > 0,
        isResolving: state.count > 0,
        error: state.error
      }),
      [state]
    ),
    manage
  ];
};
