import React, { useEffect, useState, useCallback, useMemo } from "react";
import Form, { Field, HelperMessage } from "@atlaskit/form";
import { invoke, Modal, view } from "@forge/bridge";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import Select from "@atlaskit/select";
import { selectStyles, buttonStyles } from "./Style";
import { IconButton } from "@atlaskit/button/new";
import EditIcon from "@atlaskit/icon/core/edit";

function Edit() {
  const [baseUrl, setBaseUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [defaultBaseURL, setDefaultBaseURL] = useState("");
  const [defaultReport, setDefaultReport] = useState(null);
  const [defaultProject, setDefaultProject] = useState(null);
  const [defaultHeight, setDefaultHeight] = useState(null);
  const [fieldDisabled, setFieldDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [mode, setMode] = useState("initialLogin"); // Tracks login/relogin/reconfigure modes

  // Fetch stored configurations (baseUrl, report, project, height)
  const fetchStoredConfig = useCallback(async () => {
    try {
      const confs = await invoke("getConfigurations");
      const storedBaseUrl = await invoke("getBaseUrl");
      const storedReport = confs.report;
      const storedProject = confs.project;
      const storedHeight = confs.height;

      if (storedBaseUrl) {
        setDefaultBaseURL(storedBaseUrl.payload);
        setBaseUrl(storedBaseUrl.payload); // Set baseUrl for reconfigure mode
      }

      if (storedReport) {
        setDefaultReport({ label: storedReport.label, value: storedReport.value });
      }

      if (storedHeight) {
        setDefaultHeight(storedHeight);
      }

      if (storedProject) {
        setDefaultProject(
          Object.keys(storedProject).length === 0
            ? { label: "", value: "" }
            : { label: storedProject, value: storedProject }
        );
      }
    } catch (error) {
      console.error("Error fetching stored config:", error);
    }
  }, []);

  useEffect(() => {
    fetchStoredConfig();
  }, [fetchStoredConfig]);

  // Fetch Jira projects when authToken is available
  useEffect(() => {
    if (!authToken) return;
    invoke("getProjects")
      .then((data) => setProjects(data))
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setProjects([]);
      });
  }, [authToken]);

  const projectOptions = useMemo(() => projects.map((p) => ({ value: p.name, label: p.name })), [projects]);

  // Fetch reports when baseUrl & authToken are set
  useEffect(() => {
    if (authToken && baseUrl) {
      getReportList(baseUrl);
    }
  }, [authToken, baseUrl]);

  // Fetch reports
  const getReportList = async (baseUrl) => {
    try {
      console.log("Fetching reports with ticket:", authToken);

      const response = await fetch(`${baseUrl}/webpart/reportConfig`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ticket: authToken,
        },
        credentials: "include",
        body: JSON.stringify({ searchType: "Report" }),
      });

      const data = await response.json();
      const sortedReports = data.reportList.report.sort((a, b) => a.entityName.localeCompare(b.entityName));
      setReports(sortedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Get context when switching from view → edit
  useEffect(() => {
    view.getContext().then((ctx) => {
      console.log("Context in edit:", ctx);
      const ctxTicket = ctx.extension.gadgetConfiguration?.ticket;
      const ctxBaseUrl = ctx.extension.gadgetConfiguration?.baseUrl;

      if (ctxTicket) {
        setAuthToken(ctxTicket);
        setButtonDisabled(true);
        setFieldDisabled(true);
        setIsTokenSet(true);
        setMode("reconfigure"); // Set mode to reconfigure
      }

      if (ctxBaseUrl) {
        setBaseUrl(ctxBaseUrl);
      }
    });
  }, []);

  // Handle when user clicks "Edit" to change Base URL
  const handleEditClick = () => {
    setAuthToken(""); // Clear token to force re-login
    setFieldDisabled(false);
    setButtonDisabled(false);
    setMode("relogin"); // Set mode to relogin
  };

  // Handle login (initial/relogin)
  const handleLogin = async (formData) => {
    const { inputUrl } = formData;
    if (!inputUrl) return;

    if (baseUrl === inputUrl) {
      setFieldDisabled(true);
      setButtonDisabled(true);
      return;
    }

    const modal = new Modal({
      resource: "modal",
      onClose: (payload) => {
        if (payload) {
          setAuthToken(payload);
          setFieldDisabled(true);
          setButtonDisabled(true);
          setMode("reconfigure"); // Switch to reconfigure mode after login
        }
      },
      size: "max",
      context: { baseUrl: inputUrl },
    });

    modal.open();
    setBaseUrl(inputUrl);
    await invoke("setBaseUrl", inputUrl);
  };

  return (
    <>
      <Form onSubmit={handleLogin}>
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <Field name="inputUrl" label="eQube-BI URL" isRequired defaultValue={defaultBaseURL}>
              {({ fieldProps }) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField {...fieldProps} isDisabled={fieldDisabled} />
                  {fieldDisabled && <IconButton icon={EditIcon} label="Edit" onClick={handleEditClick} />}
                </div>
              )}
            </Field>
            {!buttonDisabled && <Button type="submit" isDisabled={submitting} style={buttonStyles}>Login</Button>}
          </form>
        )}
      </Form>

      {authToken && (
        <Form onSubmit={() => console.log("Save Config")}>
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <Field name="report" label="Report Name" isRequired defaultValue={defaultReport}>
                {({ fieldProps }) => <Select {...fieldProps} options={[]} styles={selectStyles} isSearchable />}
              </Field>
              <Field name="project" label="Project" defaultValue={defaultProject}>
                {({ fieldProps }) => <Select {...fieldProps} options={projectOptions} styles={selectStyles} isSearchable />}
              </Field>
              <Button type="submit" isDisabled={submitting} style={buttonStyles}>Save</Button>
            </form>
          )}
        </Form>
      )}
    </>
  );
}

export default Edit;
