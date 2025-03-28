it("logs in, sets ticket and baseUrl, disables input, fetches reports and projects, and shows fields", async () => {
  // Mock `view.getContext` to return no ticket initially
  view.getContext.mockResolvedValue({ extension: { gadgetConfiguration: {} } });

  // Mock stored configurations to be fetched after login
  const mockStoredConfig = {
    report: { label: "Report 1", value: "1" },
    project: "Project A",
    height: "500",
  };
  invoke.mockResolvedValueOnce(mockStoredConfig); // Mock getConfigurations call

  // Mock stored baseUrl
  invoke.mockResolvedValueOnce({ payload: "https://example.com" }); // getBaseUrl

  // Mock reports list fetched after login
  const mockReports = [
    { id: "1", entityName: "Report 1", reportType: "Report" },
    { id: "2", entityName: "Snapshot 1", reportType: "Snapshot" },
  ];
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ reportList: { report: mockReports } }),
    })
  );

  // Mock projects fetched after login
  const mockProjects = [{ name: "Project A" }, { name: "Project B" }];
  invoke.mockResolvedValueOnce(mockProjects); // Mock getProjects call

  // Render the component
  render(<Edit />);

  // Ensure baseUrl is fetched and displayed in input
  await waitFor(() => expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument());

  // Click login button to open modal
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  // Simulate modal returning a ticket
  await act(async () => {
    Modal.mock.instances[0].onClose("mocked-ticket");
  });

  // Ensure authToken is set and baseUrl is stored
  await waitFor(() => expect(invoke).toHaveBeenCalledWith("setBaseUrl", "https://example.com"));

  // Ensure input field and login button are disabled
  expect(screen.getByDisplayValue("https://example.com")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Login" })).toBeDisabled();

  // Ensure reports are fetched and displayed in dropdown
  await waitFor(() => expect(screen.getByText("Report 1")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("Snapshot 1")).toBeInTheDocument());

  // Ensure projects are fetched and displayed
  await waitFor(() => expect(screen.getByText("Project A")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("Project B")).toBeInTheDocument());

  // Ensure default values for report, project, height are set
  expect(screen.getByText("Report 1")).toBeInTheDocument();
  expect(screen.getByText("Project A")).toBeInTheDocument();
  expect(screen.getByDisplayValue("500")).toBeInTheDocument();

  // Ensure save button is shown
  expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
});
