import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Edit from "../Edit";
import { invoke } from "@forge/bridge";

jest.mock("@forge/bridge", () => ({
  invoke: jest.fn(),
}));

describe("Edit Component - Save Button", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls setConfigurations with correct data when save is clicked", async () => {
    // Mock stored configurations
    const mockConfigurations = {
      baseUrl: "https://example.com",
      project: "Project A",
      report: "Report 1",
      height: "600",
    };

    invoke.mockImplementation((method) => {
      if (method === "getConfigurations") {
        return Promise.resolve(mockConfigurations);
      }
      if (method === "setConfigurations") {
        return Promise.resolve("Success");
      }
    });

    // Render the component
    render(<Edit />);

    // Wait for default values to be set
    await waitFor(() => {
      expect(screen.getByLabelText("eQube-BI URL")).toHaveValue("https://example.com");
      expect(screen.getByText("Project A")).toBeInTheDocument();
      expect(screen.getByText("Report 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Height")).toHaveValue("600");
    });

    // Click Save button
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    // Check if setConfigurations was called with correct data
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("setConfigurations", {
        baseUrl: "https://example.com",
        project: "Project A",
        report: "Report 1",
        height: "600",
      });
    });
  });
});
