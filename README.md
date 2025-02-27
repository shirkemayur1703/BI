const handleTicketMessage = useCallback((event) => {
  console.log('Received message from:', event.origin);

  // Ensure the message comes from the expected domain
  if (!defaultValues.baseUrl || !event.origin.includes(new URL(defaultValues.baseUrl).origin)) {
    console.warn('Received message from untrusted origin:', event.origin);
    return;
  }

  const { ticket } = event.data;
  if (ticket) {
    console.log('Received Ticket:', ticket);

    // Construct the iframe URL with the ticket
    const dashboardUrl = `${defaultValues.baseUrl}/dashboard?ticket=${ticket}`;
    setIframeSrc(dashboardUrl);

    // Remove event listener after processing the message
    window.removeEventListener('message', handleTicketMessage);
  }
}, [defaultValues.baseUrl]);





import { view } from '@forge/bridge';

const openLoginPage = (url) => {
  view.openExternalLink(url);
};

const onSubmit = async (formData) => {
  const { baseUrl, title, action } = formData;
  let generatedUrl = `${baseUrl}`;

  const params = new URLSearchParams();
  if (title) params.append('title', title.value);
  if (action) params.append('action', action.value);

  if (params.toString()) {
    generatedUrl += `?${params.toString()}`;
  }

  // Store the config in Forge storage
  await invoke('setStoredConfig', {
    baseUrl,
    title: title ? title.value : '',
    action: action ? action.value : '',
    generatedUrl,
  });

  view.submit({ generatedUrl });

  // Open the login page using Forge's method
  openLoginPage(`${baseUrl}/service/initiatelogin`);
};



{iframeSrc && (
  <iframe
    src={iframeSrc}
    width="100%"
    height="600px"
    title="Dashboard"
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  />
)}
