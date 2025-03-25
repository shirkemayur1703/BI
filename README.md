return (
    <>
      <Form onSubmit={handleLogin}>
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <Field
              name="inputUrl"
              label="eQube-BI URL"
              isRequired
              defaultValue={defaultBaseURL}
            >
              {({ fieldProps }) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField {...fieldProps} isDisabled={fieldDisabled} />
                  {fieldDisabled && (
                    <IconButton
                      icon={EditIcon}
                      label="Edit"
                      onClick={handleEditClick}
                    />
                  )}
                </div>
              )}
            </Field>
            <HelperMessage>eQube-BI Context URL</HelperMessage>
            {!buttonDisabled && (
              <Button
                type="submit"
                isDisabled={submitting}
                style={buttonStyles}
              >
                Login
              </Button>
            )}
          </form>
        )}
      </Form>

      {authToken && (
        <Form onSubmit={saveConfigs}>
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <Field
                name="report"
                label="Report Name"
                isRequired
                defaultValue={defaultReport}
              >
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    options={reportOptions}
                    menuPortalTarget={document.body}
                    isClearable
                    styles={selectStyles}
                    isSearchable
                  />
                )}
              </Field>
              <HelperMessage>eQube-BI Report Name</HelperMessage>

              <Field
                name="project"
                label="Project"
                defaultValue={defaultProject}
              >
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    options={projectOptions}
                    menuPortalTarget={document.body}
                    isClearable
                    styles={selectStyles}
                    isSearchable
                  />
                )}
              </Field>
              <HelperMessage>
                Applies selected Jira project as a filter on the selected
                eQube-BI dashboard.
              </HelperMessage>

              <Field
                name="height"
                label="Height"
                isRequired
                defaultValue={defaultHeight}
              >
                {({ fieldProps }) => (
                  <>
                    <TextField
                      {...fieldProps}
                      type="number"
                      placeholder="Report Container Height"
                      value={fieldProps.value || ""}
                    />
                    <HelperMessage>Report Container Height</HelperMessage>
                  </>
                )}
              </Field>

              <Button
                type="submit"
                isDisabled={submitting}
                style={buttonStyles}
              >
                Save
              </Button>
            </form>
          )}
        </Form>
      )}
    </>
  );
