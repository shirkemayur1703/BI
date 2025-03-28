export const invoke = jest.fn();
export const view = {
  getContext: jest.fn(),
  close: jest.fn(), // Mock view.close
};
export const Modal = jest.fn().mockImplementation(({ onClose }) => ({
  open: jest.fn(() => {
    // Simulate modal closing by calling onClose when needed
    Modal.onClose = onClose;
  }),
}));


import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Edit from "../Edit";
import { invoke, Modal } from "@forge/bridge";

jest.mock("@forge/bridge");

test("logs in and sets authToken, disables fields, fetches reports and projects", async () => {
  // Mock `invoke` for fetching configurations and reports
  invoke.mockImplementation((method) => {
    if (method === "getConfigurations") {
      return Promise.resolve({ report: null, project: null, height: null });
    }
    if (method === "setBaseUrl") {
      return Promise.resolve();
    }
    return Promise.resolve([]);
  });

  render(<Edit />);

  // Ensure only login input and button are shown initially
  expect(screen.getByLabelText("eQube-BI URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();

  // Enter base URL and trigger login
  fireEvent.change(screen.getByLabelText("eQube-BI URL"), { target: { value: "https://example.com" } });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  // Simulate modal returning ticket
  const mockTicket = "mockAuthToken123";
  await waitFor(() => {
    expect(Modal).toHaveBeenCalled(); // Ensure modal opened
    Modal.onClose(mockTicket); // Simulate modal closing with token
  });

  // Now, the login button should be disabled, and authToken should be set
  await waitFor(() => {
    expect(screen.getByLabelText("eQube-BI URL")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /login/i })).not.toBeInTheDocument();
  });

  // Check that reports and projects are fetched and dropdowns are shown
  await waitFor(() => {
    expect(invoke).toHaveBeenCalledWith("setBaseUrl", "https://example.com");
    expect(invoke).toHaveBeenCalledWith("getProjects");
    expect(invoke).toHaveBeenCalledWith("getConfigurations");
  });

  // Ensure the report and project dropdowns are in the document
  expect(screen.getByLabelText("Report Name")).toBeInTheDocument();
  expect(screen.getByLabelText("Project")).toBeInTheDocument();
  expect(screen.getByLabelText("Height")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
});
