
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
  const [selectedProjectName, setSelectedProjectName] = useState("");

  useEffect(() => {
    invoke("getProjects")
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
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
    setSelectedProjectName(event.target.value);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes(baseUrl)) return;
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData?.data?.oAuthToken) {
          setAuthToken(parsedData.data.oAuthToken);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const getReportList = async () => {
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
          searchType: "Report",
          type: "SearchCriteriaWidget",
        }),
      });
      const data = await response.json();
      const reports = data.reportList.report.sort((a, b) => a.entityName.localeCompare(b.entityName));
      setReports(reports);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (!authToken || !generatedUrl || !baseUrl) return;
    getReportList();
  }, [authToken, generatedUrl, baseUrl]);

  const onSubmit = (formData) => {
    if (!formData.baseUrl) return;
    setBaseUrl(formData.baseUrl);
    setGeneratedUrl(`${formData.baseUrl}/services/initiateLogin`);
  };

  const handleReportChange = (event) => {
    setSelectedReportID(event.target.value);
  };

  const loadDashboard = () => {
    let url = `${baseUrl}/integration?reportId=${selectedReportID}&reportType=Report`;
    if (selectedProjectName) {
      url += `&filter=${selectedProjectName}`;
    }
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
              <Button type="submit" isDisabled={submitting}>Login</Button>
              {generatedUrl && <iframe src={generatedUrl} width="100%" height="800px" title="Login Page"></iframe>}
            </>
          ) : (
            <>
              {reports.length > 0 ? (
                <>
                  <Field name="report" label="Select Report">
                    {({ fieldProps }) => (
                      <select {...fieldProps} onChange={handleReportChange}>
                        {reports.map((report, index) => (
                          <option key={index} value={report.id}>{report.entityName}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field name="project" label="Select Project (Optional)">
                    {({ fieldProps }) => (
                      <select {...fieldProps} onChange={handleProjectChange}>
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.name} value={project.name}>{project.name}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Button onClick={loadDashboard} appearance="primary">See Report</Button>
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










import React, { useEffect, useState } from "react";
import Form, { Field } from "@atlaskit/form";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import "./Styles.css";
import { view, invoke } from "@forge/bridge";

function Edit() {
  const [baseUrl, setBaseUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReportID, setSelectedReportID] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  useEffect(() => {
    invoke("getProjects")
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
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

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes(baseUrl)) return;
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData?.data?.oAuthToken) {
          setAuthToken(parsedData.data.oAuthToken);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [baseUrl]);

  useEffect(() => {
    if (!authToken || !generatedUrl || !baseUrl) return;
    (async () => {
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
        setReports(data.reportList.report.sort((a, b) => a.entityName.localeCompare(b.entityName)));
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    })();
  }, [authToken, generatedUrl, baseUrl]);

  const onSubmit = ({ baseUrl }) => {
    if (!baseUrl) return;
    setBaseUrl(baseUrl);
    setGeneratedUrl(`${baseUrl}/services/initiateLogin`);
  };

  const loadDashboard = () => {
    let url = `${baseUrl}/integration?reportId=${selectedReportID}&reportType=Report`;
    if (selectedProjectName) {
      url += `&filter=${selectedProjectName}`;
    }
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
              <Button type="submit" isDisabled={submitting}>Login</Button>
              {generatedUrl && <iframe src={generatedUrl} width="100%" height="800px" title="Login Page"></iframe>}
            </>
          ) : (
            reports.length > 0 ? (
              <>
                <Field name="report" label="Select Report">
                  {({ fieldProps }) => (
                    <select {...fieldProps} onChange={(e) => setSelectedReportID(e.target.value)}>
                      {reports.map((report) => (
                        <option key={report.id} value={report.id}>{report.entityName}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field name="project" label="Select Project (Optional)">
                  {({ fieldProps }) => (
                    <select {...fieldProps} onChange={(e) => setSelectedProjectName(e.target.value)}>
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.name} value={project.name}>{project.name}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Button onClick={loadDashboard} appearance="primary">See Report</Button>
              </>
            ) : (
              <p>No reports available.</p>
            )
          )}
        </form>
      )}
    </Form>
  );
}

export default Edit;






import Resolver from "@forge/resolver";
import api from "@forge/api";

const resolver = new Resolver();

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

resolver.define("getReports", async ({ payload }) => {
  const { baseUrl, authToken } = payload;

  try {
    const response = await api.fetch(`${baseUrl}/webpart/reportConfig`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ticket: authToken,
      },
      credentials: "include",
      body: JSON.stringify({ searchType: "Report", type: "SearchCriteriaWidget" }),
    });

    if (!response.ok) {
      throw new Error(`ReportConfig API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.reportList?.report.sort((a, b) => a.entityName.localeCompare(b.entityName)) || [];
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
});

export const handler = resolver.getDefinitions();




import React, { useEffect, useState } from "react";
import Form, { Field } from "@atlaskit/form";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import "./Styles.css";
import { view, invoke } from "@forge/bridge";

function Edit() {
  const [baseUrl, setBaseUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReportID, setSelectedReportID] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  useEffect(() => {
    invoke("getProjects")
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
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

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes(baseUrl)) return;
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData?.data?.oAuthToken) {
          setAuthToken(parsedData.data.oAuthToken);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [baseUrl]);

  useEffect(() => {
    if (!authToken || !baseUrl) return;
    invoke("getReports", { baseUrl, authToken })
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data.sort((a, b) => a.entityName.localeCompare(b.entityName)));
        } else {
          console.error("Unexpected data format:", data);
          setReports([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setReports([]);
      });
  }, [authToken, baseUrl]);

  const onSubmit = ({ baseUrl }) => {
    if (!baseUrl) return;
    setBaseUrl(baseUrl);
    setGeneratedUrl(`${baseUrl}/services/initiateLogin`);
  };

  const loadDashboard = () => {
    let url = `${baseUrl}/integration?reportId=${selectedReportID}&reportType=Report`;
    if (selectedProjectName) {
      url += `&filter=${selectedProjectName}`;
    }
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
              <Button type="submit" isDisabled={submitting}>Login</Button>
              {generatedUrl && <iframe src={generatedUrl} width="100%" height="800px" title="Login Page"></iframe>}
            </>
          ) : (
            reports.length > 0 ? (
              <>
                <Field name="report" label="Select Report">
                  {({ fieldProps }) => (
                    <select {...fieldProps} onChange={(e) => setSelectedReportID(e.target.value)}>
                      {reports.map((report) => (
                        <option key={report.id} value={report.id}>{report.entityName}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field name="project" label="Select Project (Optional)">
                  {({ fieldProps }) => (
                    <select {...fieldProps} onChange={(e) => setSelectedProjectName(e.target.value)}>
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.name} value={project.name}>{project.name}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <Button onClick={loadDashboard} appearance="primary">See Report</Button>
              </>
            ) : (
              <p>No reports available.</p>
            )
          )}
        </form>
      )}
    </Form>
  );
}

export default Edit;



