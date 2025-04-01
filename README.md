var callbacks = {};

export async function invoke(fname, payload) { return callbacksfname; }

export function __define(fname, cb) { callbacks[fname] = cb; }

export function __reset() { callbacks = {}; }

// Mock for view.getContext var context = {};

export const view = { async getContext() { return context; }, };

export function __setContext(ctx) { context = ctx; }

export function __resetContext() { context = {}; }


import React from "react"; import { render, screen, waitFor } from "@testing-library/react"; import Edit from "../Edit"; import { invoke, __define, __reset } from "@forge/bridge"; import { view, __setContext, __resetContext } from "@forge/bridge"; jest.mock("@forge/bridge");

describe("Edit component - Initial Scenario", () => { beforeEach(() => { __reset(); __resetContext(); });

test("displays only baseUrl input and login button when context is empty", async () => { // Mock getBaseUrl to return "https://example.com" __define("getBaseUrl", jest.fn().mockResolvedValue({ payload: "https://example.com" }));

// Mock view.getContext to return an empty gadgetConfiguration
__setContext({ extension: { gadgetConfiguration: {} } });

render(<Edit />);

// Wait for baseUrl to be populated
await waitFor(() => {
  expect(screen.getByLabelText("eQube-BI URL")).toHaveValue("https://example.com");
});

// Ensure getBaseUrl was called
expect(invoke).toHaveBeenCalledWith("getBaseUrl");

// Ensure view.getContext was called and gadgetConfiguration is empty
await waitFor(async () => {
  const ctx = await view.getContext();
  expect(ctx.extension.gadgetConfiguration).toEqual({});
});

// Ensure authToken is NOT set (i.e., Login button should be visible)
expect(screen.getByText("Login")).toBeInTheDocument();

}); });




