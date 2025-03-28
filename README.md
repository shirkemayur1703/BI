const invoke = jest.fn();

const Modal = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  close: jest.fn(),
  onClose: jest.fn((callback) => {
    callback("auth_ticket_123"); // Simulate modal returning a ticket
  }),
}));

const view = {
  getContext: jest.fn().mockResolvedValue({
    extension: { gadgetConfiguration: {} }, // No context initially
  }),
};

export { invoke, Modal, view };



import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Edit from "../Edit"; // Adjust the path as needed
import { invoke, Modal, view } from "@forge/bridge";

// Mock Forge bridge
jest.mock("@forge/bridge");

describe("Edit Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Logs in via modal, sets authToken, disables fields, and fetches reports/projects", async () => {
    // Mock `invoke` responses
    invoke.mockImplementation((method, payload) => {
      switch (method) {
        case "setBaseUrl":
          return Promise.resolve();
        case "getProjects":
          return Promise.resolve([{ name: "Project A" }, { name: "Project B" }]);
        case "getConfigurations":
          return Promise.resolve({
            report: { label: "Report 1", value: "r1" },
            project: "Project A",
            height: "500",
          });
        default:
          return Promise.resolve();
      }
    });

    render(<Edit />);

    // Initially, only URL input and login button should be present
    expect(screen.getByLabelText("eQube-BI URL")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();

    // Enter a Base URL and click login
    fireEvent.change(screen.getByLabelText("eQube-BI URL"), {
      target: { value: "https://example.com" },
    });

    fireEvent.click(screen.getByText("Login"));

    // Simulate modal opening and returning a ticket
    await waitFor(() => {
      expect(Modal).toHaveBeenCalled();
      expect(invoke).toHaveBeenCalledWith("setBaseUrl", "https://example.com");
    });

    // Check that authToken is set and login fields are disabled
    expect(screen.getByLabelText("eQube-BI URL")).toBeDisabled();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();

    // Wait for reports and projects to load
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("getProjects");
      expect(screen.getByText("Report 1")).toBeInTheDocument();
      expect(screen.getByText("Project A")).toBeInTheDocument();
    });

    // Ensure height input and save button are present
    expect(screen.getByLabelText("Height")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
