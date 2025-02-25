import React, { useEffect, useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button, { ButtonGroup } from '@atlaskit/button';
import Spinner from '@atlaskit/spinner'; // Import Spinner
import { invoke, view } from '@forge/bridge';
import { selectStyles } from './Styles'; // Import styles

function Edit() {
  const [initialData, setInitialData] = useState({
    baseUrl: '',
    title: null, 
    action: null,
  });

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingConfig, setFetchingConfig] = useState(true); // Track config loading state

  useEffect(() => {
    const fetchStoredConfig = async () => {
      setFetchingConfig(true);
      const storedConfig = await invoke('getStoredConfig');
      console.log("Stored Config:", storedConfig);
      if (storedConfig) {
        setInitialData({
          baseUrl: storedConfig.baseUrl || '',
          title: storedConfig.title ? { label: storedConfig.title, value: storedConfig.title } : null,
          action: storedConfig.action ? { label: storedConfig.action, value: storedConfig.action } : null,
        });
      }
      setFetchingConfig(false);
    };

    const fetchCountries = async () => {
      try {
        const countryOptions = await invoke('getCountries');
        console.log("Fetched Countries:", countryOptions);
        
        if (Array.isArray(countryOptions) && countryOptions.length > 0) {
          setCountries(countryOptions);
        } else {
          console.error("Invalid country options:", countryOptions);
          setCountries([{ label: 'No countries found', value: '' }]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([{ label: 'Error fetching countries', value: '' }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoredConfig();
    fetchCountries();
  }, []);

  const onSubmit = async (formData) => {
    const { baseUrl, title, action } = formData;
    let generatedUrl = `${baseUrl}`;

    const params = new URLSearchParams();
    if (title) params.append('title', title.value);
    if (action) params.append('action', action.value);

    if (params.toString()) {
      generatedUrl += `?${params.toString()}`;
    }

    await invoke('setStoredConfig', {
      baseUrl,
      title: title ? title.value : '',
      action: action ? action.value : '',
      generatedUrl,
    });

    view.submit({ generatedUrl });
  };

  return (
    <>
      {fetchingConfig ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Spinner size="large" />
        </div>
      ) : (
        <Form onSubmit={onSubmit}>
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <Field name="baseUrl" label="Base URL" isRequired defaultValue={initialData.baseUrl}>
                {({ fieldProps }) => <TextField {...fieldProps} />}
              </Field>
              
              <Field name="title" label="Country (Title)" defaultValue={initialData.title}>
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    options={loading ? [{ label: 'Loading...', value: '' }] : countries}
                    isClearable
                    menuPortalTarget={document.body} 
                    styles={selectStyles} // Apply styles
                  />
                )}
              </Field>

              <Field name="action" label="Action" defaultValue={initialData.action}>
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    options={[
                      { label: 'History', value: 'history' },
                      { label: 'Future', value: 'future' },
                    ]}
                    isClearable
                    menuPortalTarget={document.body}  
                    styles={selectStyles} // Apply styles
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
      )}
    </>
  );
}

export default Edit;
