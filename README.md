import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";

const resolver = new Resolver();

resolver.define("getText", (req) => {
  console.log(req);
  return "Hello world!";
});

resolver.define("getProjects", async () => {
  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/project/search`, {
        headers: {
          Accept: "application/json",
        },
      });

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); 
    console.log("Jira API Response:", data);

    return data.values;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { values: [] }; 
  }
});

export const handler = resolver.getDefinitions();





import React, { useEffect, useState } from "react";
import Form, { Field } from "@atlaskit/form";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import "./Styles.css";
import { view } from "@forge/bridge";
import { invoke } from "@forge/bridge";

function Edit() {
  const [baseUrl, setBaseUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReportID, setSelectedReportID] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectID, setSelectedProjectID] = useState("");


  useEffect(() => {
    invoke("getProjects")
      .then((data) => {
        
        if (Array.isArray(data)) {
          setProjects(data);
          console.log("data",typeof data);
          
          console.log(data);
          
          
        } else {

          console.error("Unexpected data format:", data);
          setProjects([]); 
        }
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setProjects([]); 
      });
  }, []);

  const handleProjectChange = (event) => {
    setSelectedProjectID(event.target.value);
  };

  useEffect(() => {
    

    const handleMessage = (event) => {
      if (!event.origin.includes(baseUrl)) return;

      try {
        const parsedData = JSON.parse(event.data);

        if (parsedData?.data?.oAuthToken) {
          setAuthToken(parsedData.data.oAuthToken);
          console.log("oAuthToken:", parsedData.data.oAuthToken);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  

  const getReportList = async (oAuthToken, baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/webpart/reportConfig`, {
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

      console.log("Reports", data.reportList.report);
      const reports = data.reportList.report;

      reports.sort((a, b) => {
        if (a.entityName < b.entityName) {
          return -1;
        }

        if (a.entityName > b.entityName) {
          return 1;
        }

        return 0;
      });

      setReports(reports);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (!authToken || !generatedUrl || !baseUrl) return;
    getReportList(authToken, baseUrl);
  }, [authToken, generatedUrl, baseUrl]);

  const onSubmit = (formData) => {
    const { baseUrl } = formData;

    if (!baseUrl) return;

    setBaseUrl(baseUrl);

    setGeneratedUrl(
      `${baseUrl}/services/initiateLogin?loginCompleteURL=Integration/validate_complete.jsp&SPURL=*&clientId=WebClient`
    );
  };

  const handleReportChange = (event) => {
    const selectedId = event.target.value;

    setSelectedReportID(selectedId);
  };

  
  const loadDashboard = () => {
    console.log("Selected Report ID", selectedReportID);
    const reportID = selectedReportID;
    const reportType = "Report";
    const url = `${baseUrl}/integration?reportId=${reportID}&reportType=${reportType}`;
    console.log("genurl", url);

    view.submit({ generatedUrl: url });
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          {!authToken ? (
            <>
              <Field name="baseUrl" label="Enter eQube-BI URL" isRequired>
                {({ fieldProps }) => <TextField {...fieldProps} />}
              </Field>
              <br />
              
              <Button type="submit" isDisabled={submitting}>
                Login
              </Button>
              <br />

              {generatedUrl && (
                <iframe
                  src={generatedUrl}
                  width="100%"
                  height="800px"
                  title="Login Page"
                ></iframe>
              )}
            </>
          ) : (
            <>
              {reports.length > 0 ? (
                <>
                  <Field name="report" label="Select Report">
                    {({ fieldProps }) => (
                      <div className="custom-select">
                        <select {...fieldProps} onChange={handleReportChange}>
                          {reports.map((report, index) => (
                            <option key={index} value={report.id}>
                              {report.entityName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </Field>

                  <br />
                  <Field name="project" label="Select Project">
                  {({ fieldProps }) => (
                    <div className="custom-select">
                    <select {...fieldProps} onChange={handleProjectChange}>
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    </div>
                  )}
                </Field>
                <br />
                  <Button onClick={loadDashboard} appearance="primary">
                    See Report
                  </Button>
                </>
              ) : (
                <p>No reports available.</p>
              )}
            </>
          )}
        </form>
      )}
    </Form>
  );
}
export default Edit;




.custom-select {
  position: relative;
  min-width: 350px;
}

.custom-select select {
  appearance: none;
  width: 100%;
  font-size: 1rem;
  padding: 0.4em 0.4em 0.4em 0.4em;
  background-color: #fff;
  border: 1px solid #caced1;
  border-radius: 0.25rem;
  color: #000;
  cursor: pointer;
}

.custom-select select:focus {
  outline: none;
  border-color: #007bff;
}

option {
  border-bottom: #000;
}


import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").body.textContent;
}

function View() {
  const [context, setContext] = useState();
  const [generatedUrl, setGeneratedUrl] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContext(ctx);
      const rawUrl = ctx.extension.gadgetConfiguration?.generatedUrl || '';
      const decodedUrl = decodeHtmlEntities(rawUrl);
      setGeneratedUrl(decodedUrl);
      console.log("Generated URL for if:", decodedUrl);
    });
  }, []);

  if (!context) {
    return 'Loading...';
  }

  return (
    <div>
      {generatedUrl ? (
        <>
          <iframe 
            src={generatedUrl} 
            width="100%" 
            height="500px" 
            title="Generated View"
            key={generatedUrl} 
          ></iframe>
        </>
      ) : (
        'No URL generated yet.'
      )}
    </div>
  );
}

export default View;



modules:
  jira:dashboardGadget:
    - key: equbebi-dashboard-gadget
      title: eQube-BI Dashboard
      description: An eQube-BI dashboard gadget.
      thumbnail: https://developer.atlassian.com/platform/forge/images/icons/issue-panel-icon.svg
      resource: main
      resolver:
        function: resolver
      edit:
        resource: main
  function:
    - key: resolver
      handler: index.handler
resources:
  - key: main
    path: static/eQube-BI/build
    tunnel:
      port: 3000
permissions:
  content:
    styles:
      - unsafe-inline
    scripts:
      - 'unsafe-inline'
  scopes:
    - storage:app
    - read:jira-work
  external:
    frames:
      - '*'
    fetch:
      backend:
        - '*'
      client:
        - '*'
    fonts:
      - '*'
    styles:
      - '*'
    images:
      - '*'
    media:
      - '*'
    scripts:
      - '*'
      
    
app:
  runtime:
    name: nodejs22.x
  id: ari:cloud:ecosystem::app/8c3bbde2-f0d3-4ecb-b8ff-2b60a0e1b8a3
