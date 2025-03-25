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

  const [defaultBaseURL, setdDefaultBaseURL] = useState("");

  const [defaultReport, setdDefaultReport] = useState(null);

  const [defaultProject, setdDefaultProject] = useState(null);

  const [defaultHeight, setdDefaultHeight] = useState(null);

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

        setdDefaultBaseURL(storedBaseUrl.payload);

      }

      if (storedReport) {

        const storedReportName = storedReport.label;

        const storedReportID = storedReport.value;

        setdDefaultReport({ label: storedReportName, value: storedReportID });

      }

      if (storedHeight) {

        setdDefaultHeight(storedHeight);

      }

      if (storedProject) {

        if (Object.keys(storedProject).length === 0) {

          setdDefaultProject({ label: "", value: "" });

        } else {

          setdDefaultProject({

            label: storedProject,

            value: storedProject,

          });

        }

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

      .then((data) => {

        setProjects(data);

      })

      .catch((error) => {

        console.error("Error fetching projects:", error);

        setProjects([]);

      });

  }, [authToken]);

  const projectOptions = useMemo(

    () =>

      projects.map((project) => ({

        value: project.name,

        label: project.name,

      })),

    [projects]

  );

  const reportOptions = useMemo(

    () => [

      {

        label: "Reports",

        options: reports

          .filter((report) => report.reportType === "Report")

          .map((report) => ({

            value: report.id,

            label: report.entityName,

          })),

      },

      {

        label: "Snapshots",

        options: reports

          .filter((report) => report.reportType === "Snapshot")

          .map((report) => ({

            value: report.id,

            label: report.entityName,

          })),

      },

    ],

    [reports]

  );

  const getReportList = async (baseUrl) => {

   

    try {

      console.log("ticket", authToken);

      const response = await fetch(${baseUrl}/webpart/reportConfig, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "X-Requested-With": "XMLHttpRequest",

          ticket: authToken,

        },

        credentials: "include",

        body: JSON.stringify({

          SubscriptionType: "",

          alerts: "",

          categories: [],

          connection: "",

          creationDateType: "Day",

          cubeName: "",

          date1: "",

          date2: "",

          dateFormat: "",

          dimensionName: "",

          id: "SearchCriteriaWidget",

          lastNDays: "",

          layout: {},

          measureName: "",

          name: "",

          owner: "",

          pages: "",

          reportType: [],

          searchType: "Report",

          type: "SearchCriteriaWidget",

        }),

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

      console.log("gad ctx in edit", ctx);

      const ctxTicket = ctx.extension.gadgetConfiguration?.ticket;

      if (ctxTicket) {

        setAuthToken(ctxTicket);

        setButtonDisabled(true);

        setFieldDisabled(true);

        setIsTokenSet(true);

      }

      const ctxBaseUrl = ctx.extension.gadgetConfiguration?.baseUrl;

      if (ctxBaseUrl) {

        setBaseUrl(ctxBaseUrl);

      }

    });

    if (!authToken || !baseUrl) return;

    getReportList(baseUrl);

  }, [authToken]);

  useEffect(() => {

    if (authToken && baseUrl)

    getReportList(baseUrl);

  }, [authToken]);

  const handleLogin = async (formData) => {

    const { inputUrl } = formData;

    if (!inputUrl) return;

   

    if(baseUrl === inputUrl)

    {

      setFieldDisabled(true);

      setButtonDisabled(true);

      return;

    }

    const modal = new Modal({

      resource: "modal",

      onClose: (payload) => {

        console.log("onClose called with", payload);

        if (payload) {

          setAuthToken(payload);

          setFieldDisabled(true);

          setButtonDisabled(true);

        }

      },

      size: "max",

      context: {

        baseUrl: inputUrl,

      },

    });

    modal.open();

    setBaseUrl(inputUrl);

    await invoke("setBaseUrl", inputUrl);

  };

  const saveConfigs = async (formData) => {

    const { report, project, height } = formData;

    const reportID = report.value;

    const matchingReport = reports.find((r) => r.id === reportID);

    let reportType;

    if (matchingReport) {

      console.log("matchingReport", matchingReport);

      reportType = matchingReport.reportType;

    } else {

      console.log("Report not found");

    }

    console.log("reportType", reportType);

    let url = ${baseUrl}/integration?reportId=${reportID}&reportType=${reportType};

    if (project && project.value !== "") {

      const projectName = project.value;

      url += &filters=FilterFVE_1&FilterFVE_1_column=Project&FilterFVE_1_operator==&FilterFVE_1_values=${projectName};

      console.log("stored project", projectName);

    }

    console.log("heightip", height);

    await invoke("setConfigurations", {

      project: project ? project.value : null,

      report: report ? { label: report.label, value: report.value } : {},

      height: height ? height : "",

    });

    view.submit({

      generatedUrl: url,

      ticket: authToken,

      height: height,

      baseUrl: baseUrl,

    });

  };

  const handleEditClick = () => {

    console.log("button clicked");

    setFieldDisabled(false);

    setButtonDisabled(false);

  };

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

}

export default Edit;

