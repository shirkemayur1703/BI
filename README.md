import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Edit from "../Edit"; // Adjust path as needed
import { invoke, Modal, view } from "@forge/bridge";

// Mock Forge bridge
jest.mock("@forge/bridge");

describe("Edit Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Logs in, sets authToken, fetches reports and projects, and sets default values", async () => {
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
        case "getReports":
          return Promise.resolve([
            { id: "r1", entityName: "Report 1", reportType: "Report" },
            { id: "s1", entityName: "Snapshot 1", reportType: "Snapshot" },
          ]);
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
      expect(invoke).toHaveBeenCalledWith("getReports");
      expect(invoke).toHaveBeenCalledWith("getConfigurations");
    });

    // **Verify that reports are shown in the dropdown**
    expect(screen.getByText("Reports")).toBeInTheDocument(); // Group label
    expect(screen.getByText("Report 1")).toBeInTheDocument(); // Report fetched
    expect(screen.getByText("Snapshots")).toBeInTheDocument(); // Group label
    expect(screen.getByText("Snapshot 1")).toBeInTheDocument(); // Snapshot fetched

    // **Verify that projects are shown in the dropdown**
    expect(screen.getByText("Project A")).toBeInTheDocument();
    expect(screen.getByText("Project B")).toBeInTheDocument();

    // **Check that default values are set**
    await waitFor(() => {
      expect(screen.getByText("Report 1")).toBeInTheDocument(); // Report default value
      expect(screen.getByText("Project A")).toBeInTheDocument(); // Project default value
      expect(screen.getByDisplayValue("500")).toBeInTheDocument(); // Height default value
    });

    // Ensure Save button appears
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
