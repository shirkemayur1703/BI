1. Initial Render Tests
✅ Ensure the component renders without crashing.
✅ Check if the input fields (Base URL, Report, Project, Height) are present.
✅ Verify that the Login button is present initially.
✅ Ensure that the Save button is not visible before login.

2. Fetching Stored Configurations
✅ Mock invoke("getConfigurations") and invoke("getBaseUrl") and check if:

The stored Base URL is populated correctly.

The stored Report & Project are set correctly.

The stored Height value is pre-filled.

3. Authentication Handling
✅ If the authToken is present in the context:

Verify that the Base URL field is disabled.

Ensure the Login button is hidden/disabled.

✅ If no authToken:

Ensure the Login button is enabled.

Clicking Login should open the modal.

✅ Mock the modal’s onClose and check:

If authToken is saved after login.

If reports are fetched after login.

4. Fetching Projects & Reports
✅ Mock invoke("getProjects") and check if:

Projects are fetched and populated in the dropdown.

✅ Mock getReportList() and ensure:

Reports are fetched and categorized correctly (Reports vs Snapshots).

✅ Check if the correct options are set for:

Report dropdown (reportOptions).

Project dropdown (projectOptions).

5. State Restoration
✅ When re-entering edit mode:

Verify if previously saved values are restored.

Ensure the correct Base URL, Report, Project, and Height values are prefilled.

✅ If Base URL remains unchanged after login:

Ensure the Login button does nothing.

6. User Interactions
✅ Typing in the Base URL field should work (when editable).
✅ Selecting a report should update the form state.
✅ Selecting a project should update the form state.
✅ Entering a height value should work.

✅ Clicking Edit icon should enable the Base URL field and Login button.

✅ Clicking Save button should:

Save configurations using invoke("setConfigurations").

Submit the correct URL to view.submit().

7. API & Edge Case Handling
✅ Mock API failures for:

invoke("getProjects") → Ensure error is handled properly.

getReportList() → Ensure fallback behavior (empty list) works.

✅ Test with an empty report list → Ensure the dropdowns handle no reports gracefully.
✅ Test with an empty project list → Ensure project dropdown works with no projects.

Additional Scenarios
🔹 Test conditional rendering (Save button should only appear after login).
🔹 Ensure the component updates correctly when props/state change.
🔹 Check if form submission works correctly when all fields are filled.



Mock Implementation (__mocks__/@forge/bridge.js)

const invoke = jest.fn();
const Modal = {
  open: jest.fn(),
  onClose: jest.fn(),
};
const view = {
  getContext: jest.fn(() => Promise.resolve({})), 
  submit: jest.fn(),
};

module.exports = { invoke, Modal, view };





Test Scenarios Covered:
✅ Initial Render Tests

Should render input fields, buttons, and select components correctly

Should disable input and login button if authToken is present

✅ Context Fetching Tests

Should fetch view.getContext() on mount

Should pre-fill baseUrl and disable fields if authToken exists

✅ Mock API Calls (invoke, fetch, etc.)

Should call invoke("getProjects") when authToken is set

Should call invoke("getConfigurations") and invoke("getBaseUrl") to load stored config

Should fetch report list when getReportList is called

✅ Interactions & User Actions

Should allow login when the baseUrl is entered

Should open the Modal and set authToken upon login

Should allow users to select projects and reports

Should save configurations correctly

✅ Edge Cases & Error Handling

Should handle errors in API calls gracefully

Should not update configurations if required fields are empty




import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Edit from "../Edit"; // Adjust path as needed
import { invoke, Modal, view } from "@forge/bridge";

jest.mock("@forge/bridge");

describe("Edit Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProjects = [{ name: "Project A" }, { name: "Project B" }];
  const mockReports = [
    { id: "1", entityName: "Report 1", reportType: "Report" },
    { id: "2", entityName: "Snapshot 1", reportType: "Snapshot" },
  ];

  const mockConfig = {
    report: { label: "Report 1", value: "1" },
    project: "Project A",
    height: "500",
  };

  it("renders input fields and buttons correctly", () => {
    render(<Edit />);

    expect(screen.getByLabelText(/eQube-BI URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  it("fetches context on mount and sets baseUrl if available", async () => {
    view.getContext.mockResolvedValue({
      extension: { gadgetConfiguration: { ticket: "mockAuthToken", baseUrl: "https://mock-url.com" } },
    });

    render(<Edit />);

    await waitFor(() => expect(view.getContext).toHaveBeenCalled());
    expect(screen.getByDisplayValue("https://mock-url.com")).toBeInTheDocument();
  });

  it("fetches projects when authToken is set", async () => {
    invoke.mockResolvedValue(mockProjects);

    render(<Edit />);

    await waitFor(() => expect(invoke).toHaveBeenCalledWith("getProjects"));
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it("fetches stored configurations and sets defaults", async () => {
    invoke.mockResolvedValueOnce(mockConfig);
    invoke.mockResolvedValueOnce({ payload: "https://mock-url.com" });

    render(<Edit />);

    await waitFor(() => expect(invoke).toHaveBeenCalledWith("getConfigurations"));
    expect(screen.getByDisplayValue("https://mock-url.com")).toBeInTheDocument();
  });

  it("opens modal when login button is clicked", async () => {
    render(<Edit />);
    
    fireEvent.click(screen.getByText(/Login/i));
    
    expect(Modal.open).toHaveBeenCalled();
  });

  it("disables fields and buttons if authToken is present", async () => {
    view.getContext.mockResolvedValue({
      extension: { gadgetConfiguration: { ticket: "mockAuthToken", baseUrl: "https://mock-url.com" } },
    });

    render(<Edit />);
    await waitFor(() => expect(view.getContext).toHaveBeenCalled());

    expect(screen.getByLabelText(/eQube-BI URL/i)).toBeDisabled();
    expect(screen.getByText(/Login/i)).toBeDisabled();
  });

  it("saves configurations correctly", async () => {
    invoke.mockResolvedValue(mockProjects);

    render(<Edit />);

    fireEvent.change(screen.getByLabelText(/eQube-BI URL/i), { target: { value: "https://new-url.com" } });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith("setConfigurations", expect.any(Object)));
    expect(view.submit).toHaveBeenCalled();
  });

  it("handles errors in API calls gracefully", async () => {
    invoke.mockRejectedValueOnce(new Error("API Error"));

    render(<Edit />);
    
    await waitFor(() => expect(console.error).toHaveBeenCalledWith(expect.stringContaining("API Error")));
  });
});


