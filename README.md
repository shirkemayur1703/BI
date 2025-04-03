const handleLogin = async (formData) => {
  const { inputUrl } = formData;
  
  if (baseUrl === inputUrl && authToken) {
    setFieldDisabled(true);
    setButtonDisabled(true);
    return;
  }

  const modal = new Modal({
    resource: "modal",
    onClose: async (ticket) => {
      if (ticket) {
        try {
          // Logout the previous session
          if (authToken && baseUrl) {
            await fetch(`${baseUrl}/serviceLogout?ticket=${authToken}`, {
              method: "GET",
              credentials: "include",
            });
          }

          // Set new authToken and baseUrl
          setAuthToken(ticket);
          setFieldDisabled(true);
          setButtonDisabled(true);
          getReportList(inputUrl, ticket);
          getProjectList();
          setBaseUrl(inputUrl);
          await invoke("setBaseUrl", inputUrl);
        } catch (error) {
          console.error("Error logging out previous session:", error);
        }
      } else {
        console.log("Modal closed without ticket");
      }
    },
    size: "max",
    context: { baseUrl: inputUrl },
  });

  modal.open();
};
