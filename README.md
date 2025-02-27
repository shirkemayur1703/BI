import React, { useEffect, useState, useCallback } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button, { ButtonGroup } from '@atlaskit/button';
import Spinner from '@atlaskit/spinner'; 
import { invoke, view } from '@forge/bridge';
import { selectStyles, spinnerStyles } from './Styles'; 

function Edit() {
  const [defaultValues, setDefaultValues] = useState({
    baseUrl: '',
    title: null, 
    action: null,
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingConfig, setFetchingConfig] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');

  // Fetch stored configuration
  const fetchStoredConfig = useCallback(async () => {
    setFetchingConfig(true);
    const storedConfig = await invoke('getStoredConfig');

    if (storedConfig) {
      setDefaultValues({
        baseUrl: storedConfig.baseUrl || '',
        title: storedConfig.title ? { label: storedConfig.title, value: storedConfig.title } : null,
        action: storedConfig.action ? { label: storedConfig.action, value: storedConfig.action } : null,
      });
    }
    setFetchingConfig(false);
  }, []);

  // Fetch country list
  const fetchCountries = useCallback(async () => {
    try {
      const countryOptions = await invoke('getCountries');
      setCountries(countryOptions);
    } catch (error) {
      setCountries([{ label: 'No Countries Found', value: '' }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoredConfig();
    fetchCountries();
  }, [fetchStoredConfig, fetchCountries]);

  // Function to open login page securely
  const openLoginPage = (url) => {
    view.openExternalLink(url);
  };

  // Handle messages from the login page
  const handleTicketMessage = useCallback((event) => {
    console.log('Received message from:', event.origin);

    // Ensure the message comes from the expected domain
    if (!defaultValues.baseUrl) {
      console.warn('Base URL not set, ignoring message.');
      return;
    }

    const expectedOrigin = new URL(defaultValues.baseUrl).origin;
    if (!event.origin.includes(expectedOrigin)) {
      console.warn('Received message from untrusted origin:', event.origin);
      return;
    }

    const { ticket } = event.data;
    if (ticket) {
      console.log('Received Ticket:', ticket);

      // Update the iframe to show the dashboard with the ticket
      const dashboardUrl = `${defaultValues.baseUrl}/dashboard?ticket=${ticket}`;
      setIframeSrc(dashboardUrl);

      // Remove event listener after receiving the ticket
      window.removeEventListener('message', handleTicketMessage);
    }
  }, [defaultValues.baseUrl]);

  useEffect(() => {
    window.addEventListener('message', handleTicketMessage);
    return () => {
      window.removeEventListener('message', handleTicketMessage);
    };
  }, [handleTicketMessage]);

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

  return (
    <>
      {fetchingConfig ? (
        <div style={spinnerStyles}>
          <Spinner size="large" />
        </div>
      ) : (
        <>
          <Form onSubmit={onSubmit}>
            {({ formProps, submitting }) => (
              <form {...formProps}>
                <Field name="baseUrl" label="Base URL" isRequired defaultValue={defaultValues.baseUrl}>
                  {({ fieldProps }) => <TextField {...fieldProps} />}
                </Field>
                
                <Field name="title" label="Title" defaultValue={defaultValues.title}>
                  {({ fieldProps }) => (
                    <Select
                      {...fieldProps}
                      options={loading ? [{ label: 'Loading...', value: '' }] : countries}
                      isClearable
                      menuPortalTarget={document.body} 
                      styles={selectStyles} 
                    />
                  )}
                </Field>

                <Field name="action" label="Action" defaultValue={defaultValues.action}>
                  {({ fieldProps }) => (
                    <Select
                      {...fieldProps}
                      options={[
                        { label: 'History', value: 'history' },
                        { label: 'Future', value: 'future' },
                      ]}
                      isClearable
                      menuPortalTarget={document.body}  
                      styles={selectStyles} 
                    />
                  )}
                </Field>

                <br />
                <ButtonGroup>
                  <Button type="submit" isDisabled={submitting}>
                    Load Dashboard
                  </Button>
                  <Button appearance="subtle" onClick={view.close}>
                    Cancel
                  </Button>
                </ButtonGroup>
              </form>
            )}
          </Form>

          {/* Iframe to show dashboard after login */}
          {iframeSrc && (
            <iframe
              src={iframeSrc}
              width="100%"
              height="600px"
              title="Dashboard"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </>
      )}
    </>
  );
}

export default Edit;
