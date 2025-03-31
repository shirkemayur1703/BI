import React from "react"; import { render, screen, waitFor } from "@testing-library/react"; import userEvent from "@testing-library/user-event"; import Edit from "./Edit"; import { invoke, view } from "@forge/bridge";

jest.mock("@forge/bridge", () => { const callbacks = {}; return { invoke: jest.fn((fname, payload) => callbacksfname), view: { getContext: jest.fn(), }, __define: (fname, cb) => { callbacks[fname] = cb; }, __reset: () => { Object.keys(callbacks).forEach(key => delete callbacks[key]); }, }; });

describe("Edit Component - Initial Scenario", () => { beforeEach(() => { jest.clearAllMocks(); });

test("invoke('getBaseUrl') is called and input field with login button is rendered", async () => { invoke.mockResolvedValueOnce({ payload: "https://example.com" }); view.getContext.mockResolvedValueOnce({ extension: { gadgetConfiguration: {} } });

render(<Edit />);

await waitFor(() => {
  expect(invoke).toHaveBeenCalledWith("getBaseUrl");
});

expect(view.getContext).toHaveBeenCalled();
expect(screen.getByLabelText(/eQube-BI URL/i)).toHaveValue("https://example.com");
expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();

// Ensure that context is empty at the beginning
await waitFor(() => {
  expect(view.getContext).toHaveReturnedWith(
    expect.objectContaining({ extension: { gadgetConfiguration: {} } })
  );
});

}); });

