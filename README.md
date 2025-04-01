var callbacks = {};

export async function invoke(fname, payload) { return callbacksfname; }

export function __define(fname, cb) { callbacks[fname] = cb; }

export function __reset() { callbacks = {}; }

var viewContextMock = {};

export async function getContext() { return viewContextMock; }

export function __setContext(context) { viewContextMock = context; }

export function __resetContext() { viewContextMock = {}; }

/**

These tests verify that the resolver mock works as expected */


import { invoke, __define, __reset } from "@forge/bridge"; import { getContext, __setContext, __resetContext } from "@forge/bridge"; import { beforeEach, expect } from "@jest/globals"; jest.mock("@forge/bridge");

describe("bridge api", () => { beforeEach(() => { __reset(); });

test("invokes a defined function", async () => { const testerCb = jest.fn().mockResolvedValue("helloWorld"); __define("tester", testerCb); const payload = { name: "joe", year: 1942 }; const result = await invoke("tester", payload); expect(testerCb).toHaveBeenCalledWith(payload); expect(result).toEqual("helloWorld"); });

test("handles multiple functions", async () => { const f1 = jest.fn().mockResolvedValue("f1Value"); __define("f1", f1);

const f2 = jest.fn().mockResolvedValue("f2Value");
__define("f2", f2);

const payload = { name: "joe", year: 1942 };
const result1 = await invoke("f1", payload);
expect(f1).toHaveBeenCalledWith(payload);
expect(result1).toEqual("f1Value");

const result2 = await invoke("f2", payload);
expect(f2).toHaveBeenCalledWith(payload);
expect(result2).toEqual("f2Value");

}); });

describe("view.getContext mock", () => { beforeEach(() => { __resetContext(); });

test("returns the set context", async () => { const testContext = { extension: { gadgetConfiguration: { key: "value" } } }; __setContext(testContext); const result = await getContext(); expect(result).toEqual(testContext); });

test("returns empty object by default", async () => { const result = await getContext(); expect(result).toEqual({}); }); });

