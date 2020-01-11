import { usePromiseManager } from "./";
import { renderHook, act, cleanup } from "@testing-library/react-hooks";

afterEach(cleanup);

const ERROR_MESSAGE = "unknown error";
const RESOLVE_OBJECT = { data: "result of call" };

const dummyResolveFuncAsync = ({ ms }: { ms: number }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(RESOLVE_OBJECT), ms);
  });
};
const dummyRejectFuncAsync = ({ ms }: { ms: number }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(ERROR_MESSAGE), ms);
  });
};

describe("usePromiseManager", () => {
  test("single resolve promise", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromiseManager());

    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });

    act(() => {
      result.current[1](dummyResolveFuncAsync({ ms: 100 })).then(result => {
        expect(result).toEqual(RESOLVE_OBJECT);
      });
    });
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });
  });

  test("single reject promise", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromiseManager());

    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });

    act(() => {
      result.current[1](dummyRejectFuncAsync({ ms: 100 })).catch(error => {
        expect(error).toEqual(ERROR_MESSAGE);
      });
    });
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: true,
      isResolving: false,
      error: [ERROR_MESSAGE]
    });
  });

  test("single reject promise resets when new promise is managed", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromiseManager());

    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });

    act(() => {
      result.current[1](dummyRejectFuncAsync({ ms: 100 })).catch(error => {
        expect(error).toEqual(ERROR_MESSAGE);
      });
      setTimeout(() => {
        result.current[1](dummyResolveFuncAsync({ ms: 100 })).then(result => {
          expect(result).toEqual(RESOLVE_OBJECT);
        });
      }, 110);
    });
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: true,
      isResolving: false,
      error: [ERROR_MESSAGE]
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });
  });

  test("paralel resolve promises", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromiseManager());

    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });

    act(() => {
      result.current[1](dummyResolveFuncAsync({ ms: 100 })).then(result => {
        expect(result).toEqual(RESOLVE_OBJECT);
      });
      setTimeout(() => {
        result.current[1](dummyResolveFuncAsync({ ms: 100 })).then(result => {
          expect(result).toEqual(RESOLVE_OBJECT);
        });
      }, 50);
    });
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });
  });

  test("paralel reject promises", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromiseManager());

    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });

    act(() => {
      result.current[1](dummyRejectFuncAsync({ ms: 100 })).catch(error => {
        expect(error).toEqual(ERROR_MESSAGE);
      });
      setTimeout(() => {
        result.current[1](dummyRejectFuncAsync({ ms: 100 })).catch(error => {
          expect(error).toEqual(ERROR_MESSAGE);
        });
      }, 50);
    });
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: true,
      isResolving: true,
      error: [ERROR_MESSAGE]
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: true,
      isResolving: false,
      error: [ERROR_MESSAGE, ERROR_MESSAGE]
    });
  });

  test("paralel mixed resolve and reject promises", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromiseManager());

    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: false,
      error: []
    });

    act(() => {
      result.current[1](dummyRejectFuncAsync({ ms: 100 })).catch(error => {
        expect(error).toEqual(ERROR_MESSAGE);
      });
      setTimeout(() => {
        result.current[1](dummyResolveFuncAsync({ ms: 100 })).then(result => {
          expect(result).toEqual(RESOLVE_OBJECT);
        });
      }, 50);
    });
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: false,
      isResolving: true,
      error: []
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: true,
      isResolving: true,
      error: [ERROR_MESSAGE]
    });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({
      hasError: true,
      isResolving: false,
      error: [ERROR_MESSAGE]
    });
  });
});
