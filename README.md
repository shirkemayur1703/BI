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

  const fetchStoredConfig = useCallback(async () => {
    try {
      const confs = await invoke("getConfigurations");
      const storedBaseUrl = await invoke("getBaseUrl");
      const storedReport = confs.report;
      const storedProject = confs.project;
      const storedHeight = confs.height;

      if (storedBaseUrl) {
        setDefaultBaseURL(storedBaseUrl.payload);
      }

      if (storedReport) {
        setDefaultReport({ label: storedReport.label, value: storedReport.value });
      }

      if (storedHeight) {
        setDefaultHeight(storedHeight);
      }

      if (storedProject) {
        setDefaultProject(Object.keys(storedProject).length === 0
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

  useEffect(() => {
    if (!authToken) return;
    invoke("getProjects")
      .then(setProjects)
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setProjects([]);
      });
  }, [authToken]);

  const projectOptions = useMemo(() => projects.map((project) => ({
    value: project.name,
    label: project.name,
  })), [projects]);

  const reportOptions = useMemo(() => [
    {
      label: "Reports",
      options: reports.filter((report) => report.reportType === "Report").map((report) => ({
        value: report.id,
        label: report.entityName,
      })),
    },
    {
      label: "Snapshots",
      options: reports.filter((report) => report.reportType === "Snapshot").map((report) => ({
        value: report.id,
        label: report.entityName,
      })),
    },
  ], [reports]);

  const getReportList = async (baseUrl) => {
    if (!authToken) return;
    try {
      const response = await fetch(`${baseUrl}/webpart/reportConfig`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ticket: authToken,
        },
        credentials: "include",
        body: JSON.stringify({ searchType: "Report", type: "SearchCriteriaWidget" }),
      });

      const data = await response.json();
      const sortedReports = data.reportList.report.sort((a, b) =>
        a.entityName.localeCompare(b.entityName)
      );

      setReports(sortedReports);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    view.getContext().then((ctx) => {
      const ctxTicket = ctx.extension.gadgetConfiguration?.ticket;
      const ctxBaseUrl = ctx.extension.gadgetConfiguration?.baseUrl;

      if (ctxTicket) {
        setAuthToken(ctxTicket);
        setButtonDisabled(true);
        setFieldDisabled(true);
        setIsTokenSet(true);
      }

      if (ctxBaseUrl) {
        setBaseUrl(ctxBaseUrl);
      }
    });

    if (authToken && baseUrl) getReportList(baseUrl);
  }, [authToken, baseUrl]);

  const handleLogin = async (formData) => {
    const { inputUrl } = formData;
    if (!inputUrl || baseUrl === inputUrl) {
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
        }
      },
      size: "max",
      context: { baseUrl: inputUrl },
    });

    modal.open();
    setBaseUrl(inputUrl);
    await invoke("setBaseUrl", inputUrl);
  };

  const saveConfigs = async (formData) => {
    const { report, project, height } = formData;
    const reportID = report.value;
    const matchingReport = reports.find((r) => r.id === reportID);
    let reportType = matchingReport?.reportType;

    let url = `${baseUrl}/integration?reportId=${reportID}&reportType=${reportType}`;
    if (project && project.value) {
      url += `&filters=FilterFVE_1&FilterFVE_1_column=Project&FilterFVE_1_operator==&FilterFVE_1_values=${project.value}`;
    }

    await invoke("setConfigurations", {
      project: project?.value || null,
      report: report ? { label: report.label, value: report.value } : {},
      height: height || "",
    });

    view.submit({ generatedUrl: url, ticket: authToken, height, baseUrl });
  };

  const handleEditClick = () => {
    setFieldDisabled(false);
    setButtonDisabled(false);
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
                  {fieldDisabled && (
                    <IconButton icon={EditIcon} label="Edit" onClick={handleEditClick} />
                  )}
                </div>
              )}
            </Field>
            {!buttonDisabled && <Button type="submit" isDisabled={submitting} style={buttonStyles}>Login</Button>}
          </form>
        )}
      </Form>

      {authToken && (
        <Form onSubmit={saveConfigs}>
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <Field name="report" label="Report Name" isRequired defaultValue={defaultReport}>
                {({ fieldProps }) => <Select {...fieldProps} options={reportOptions} styles={selectStyles} />}
              </Field>
              <Field name="project" label="Project" defaultValue={defaultProject}>
                {({ fieldProps }) => <Select {...fieldProps} options={projectOptions} styles={selectStyles} />}
              </Field>
              <Field name="height" label="Height" isRequired defaultValue={defaultHeight}>
                {({ fieldProps }) => <TextField {...fieldProps} type="number" placeholder="Report Container Height" />}
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
