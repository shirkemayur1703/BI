beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          reportList: {
            report: [
              { id: "1", entityName: "Report A", reportType: "Report" },
              { id: "2", entityName: "Snapshot B", reportType: "Snapshot" },
              { id: "3", entityName: "Report C", reportType: "Report" },
            ],
          },
        }),
    })
  );
});

afterAll(() => {
  global.fetch.mockRestore();
});


expect(global.fetch).toHaveBeenCalled();
expect(global.fetch).toHaveBeenCalledWith(
  expect.any(String), 
  expect.objectContaining({ method: "POST" })
);
