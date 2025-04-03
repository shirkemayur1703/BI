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
          // Logout previous session only if authToken exists
          if (authToken && baseUrl) {
            const logoutUrl = `${baseUrl}/serviceLogout?ticket=${authToken}`;
            const response = await fetch(logoutUrl, {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              console.warn("Logout failed:", response.statusText);
            }
          }

          // Proceed with setting the new session
          setAuthToken(ticket);
          setFieldDisabled(true);
          setButtonDisabled(true);
          await getReportList(inputUrl, ticket);
          await getProjectList();
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
