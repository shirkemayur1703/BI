import React, { useEffect, useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button, { ButtonGroup } from '@atlaskit/button';
import { invoke, view } from '@forge/bridge';

function Edit() {
  const [initialData, setInitialData] = useState({
    baseUrl: '',
    title: '',
    action: null,
  });

  useEffect(() => {
    
    const fetchStoredConfig = async () => {
      const storedConfig = await invoke('getStoredConfig');
      if (storedConfig) {
        setInitialData({
          baseUrl: storedConfig.baseUrl || '',
          title: storedConfig.title || '',
          action: storedConfig.action || null,
        });
      }
    };

    fetchStoredConfig();
  }, []);

  const onSubmit = async (formData) => {
    const { baseUrl, title, action } = formData;
    let generatedUrl = `${baseUrl}`;

    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (action) params.append('action', action.value);

    if (params.toString()) {
      generatedUrl += `?${params.toString()}`;
    }

    
    await invoke('setStoredConfig', {
      baseUrl,
      title,
      action,
      generatedUrl,
    });

    
    view.submit({ generatedUrl });
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <Field name="baseUrl" label="Base URL" isRequired defaultValue={initialData.baseUrl}>
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <Field name="title" label="Title" defaultValue={initialData.title}>
            {({ fieldProps }) => <TextField {...fieldProps} />}
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
              />
            )}
          </Field>
          <br />
          <ButtonGroup>
            <Button type="submit" isDisabled={submitting}>
              Load the URL
            </Button>
            <Button appearance="subtle" onClick={view.close}>
              Cancel
            </Button>
          </ButtonGroup>
        </form>
      )}
    </Form>
  );
}

export default Edit;
