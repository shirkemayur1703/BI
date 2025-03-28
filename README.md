import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { invoke, view } from "@forge/bridge";
import Edit from "../Edit"; // Adjust the path as needed

jest.mock("@forge/bridge");

describe("Edit Component - Fetch Stored Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch stored context, set authToken, fetch reports, and disable login elements", async () => {
    // Mock stored context data
    const storedContext = {
      ticket: "mocked-ticket",
      baseUrl: "https://example.com",
    };

    view.getContext.mockResolvedValue(storedContext);

    // Mock report fetching
    const mockReports = [
      { id: "1", entityName: "Report 1", reportType: "Report" },
      { id: "2", entityName: "Snapshot 1", reportType: "Snapshot" },
    ];
    invoke.mockImplementation((method) => {
      if (method === "getReports") return Promise.resolve(mockReports);
      return Promise.resolve(null);
    });

    render(<Edit />);

    // Wait for fetchContext to complete
    await waitFor(() => {
      expect(view.getContext).toHaveBeenCalled();
      expect(invoke).toHaveBeenCalledWith("getReports", expect.any(Object));
    });

    // Check if stored data is set in the UI
    expect(screen.getByRole("textbox", { name: /eQube-BI URL/i })).toHaveValue("https://example.com");
    expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();

    // Check if reports are set in dropdown
    expect(screen.getByText("Report 1")).toBeInTheDocument();
    expect(screen.getByText("Snapshot 1")).toBeInTheDocument();
  });
});
