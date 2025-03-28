it("renders only the input field and login button when no context is available", async () => {
  // Mock `view.getContext` to return no ticket or baseUrl
  view.getContext.mockResolvedValue({ extension: { gadgetConfiguration: {} } });

  // Mock `invoke("getConfigurations")` to return stored config
  const mockStoredConfig = {
    report: { label: "Report 1", value: "1" },
    project: "Project A",
    height: "500",
  };
  invoke.mockResolvedValueOnce(mockStoredConfig);

  // Mock `invoke("getBaseUrl")` to return a stored baseUrl
  invoke.mockResolvedValueOnce({ payload: "https://example.com" });

  render(<Edit />);

  // Ensure `getContext` was called but returned empty
  await waitFor(() => expect(view.getContext).toHaveBeenCalled());

  // Ensure stored baseUrl is fetched
  await waitFor(() => expect(invoke).toHaveBeenCalledWith("getBaseUrl"));

  // Verify the input field displays the stored baseUrl
  expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();

  // Verify the login button is present
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();

  // Ensure reports and projects dropdowns are NOT present
  expect(screen.queryByLabelText("Report Name")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Project")).not.toBeInTheDocument();

  // Ensure height input field is NOT present
  expect(screen.queryByLabelText("Height")).not.toBeInTheDocument();

  // Ensure save button is NOT present
  expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
});
