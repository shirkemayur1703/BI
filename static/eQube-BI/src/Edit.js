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
        <div style={spinnerStyles}>
          <Spinner size="large" />
        </div>
      ) : (
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
                  Cancel it
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
