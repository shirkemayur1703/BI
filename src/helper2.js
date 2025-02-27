$("head").append(
  '<script type="text/javascript" src="../../../Style%20Library/eQubeBI%20Helper/underscore-1.7.0.js"></script>'
);
$("head").append(
  '<script type="text/javascript" src="../../../Style%20Library/eQubeBI%20Helper/RequestTokenGenerator.js"></script>'
);

$(document).ready(function () {
  hideAllListBoxes();
  var tokenGenerator = new RequestTokenGenerator();
  var checkAuthentication = 0;
  var tokenDetails;
  var receiveMessageProxy = $.proxy(receiveMessage, this);
  checkForSessionStorage();

  function checkForSessionStorage() {
    if (
      $("[id$=eQubeBI_URL_EDITOR]").val() != "" &&
      $("[id$=eQubeBI_URL_EDITOR]").val() != undefined
    ) {
      if (!sessionStorage.oAuthTokenData) {
        tokenDetails = {};
        callAuthentication();
      } else {
        tokenDetails = JSON.parse(sessionStorage.getItem("oAuthTokenData"));
        var contextURL = $("[id$=eQubeBI_URL_EDITOR]").val();
        if (!tokenDetails[contextURL]) {
          callAuthentication();
        } else {
          var serverData = tokenGenerator.init(contextURL);
          serverData.def.done(function () {
            var oToken = tokenDetails[contextURL];
            reportUnsecure(oToken);
          });
        }
      }
    }
  }

  function callAuthentication() {
    var serverData = tokenGenerator.init($("[id$=eQubeBI_URL_EDITOR)").val());
    serverData.def.done(function () {
      window.addEventListener("message", receiveMessageProxy);
      doAuthentication({
        applicationType: "Integration",
        target: "loginFrame",
        localization: serverData.localization,
      });
    });
  }

  function doAuthentication(object) {
    if (object.target === undefined || object.target == "") {
      object.target = "_blank";
    }

    var my_form = document.createElement("FORM");
    my_form.name = "myForm";
    my_form.method = "POST";
    my_form.action =
      $("[id$=eQubeBI_URL_EDITOR]").val() + "/services/initiateLogin";
    my_form.target = object.target;

    my_tb = document.createElement("INPUT");
    my_tb.type = "hidden";
    my_tb.name = "loginCompleteURL";
    my_tb.value =
      "Integration/validate_complete.jsp?" +
      "SPURL=" +
      encodeURIComponent(window.location.href);
    my_form.appendChild(my_tb);

    my_tb = document.createElement("INPUT");
    my_tb.type = "hidden";
    my_tb.name = "clientId";
    my_tb.value = "WebClient";
    my_form.appendChild(my_tb);

    if (object.localization === "true") {
      my_tb = document.createElement("INPUT");
      my_tb.type = "hidden";
      my_tb.name = "lang";
      my_tb.value = $("[id$=sharePointLocaleeport]").val().replace("-", "_");
      my_form.appendChild(my_tb);
    }

    document.body.appendChild(my_form);
    my_form.submit();
    checkAuthentication - 1;
  }
  function receiveMessage(e) {
    if (e.data == "MULTIPLE_USERS" || e.data == "9097") {
      enableReportSelectionErrorMsgs();
      $("[id$=reportErrorMessage]").text(
        "Please log out from other applications"
      );
      window.removeEventListener("message", receiveMessageProxy);
    } else {
      disableReportSelectionErrorMsgs();
      var contextURL = $("[id$=eQubeBI_URL_EDITOR]").val();
      var otoken = e.data;
      if (!otoken.source) {
        var otokenEncrypted = otoken;
        tokenDetails[contextURL] = otokenEncrypted;
        sessionStorage.setItem("oAuthTokenData", JSON.stringify(tokenDetails));
        reportUnsecure(otoken);
        window.removeEventListener("message", receiveMessageProxy);
      }
    }
  }

  function reportUnsecure(oAuthToken) {
    var def = $.ajax({
      type: "POST",
      url: $("[id$=eQubeBI_URL_EDITOR]").val() + "/webpart/reportConfig",
      contentType: "application/json",
      dataType: "json",
      headers: {
        ticket: oAuthToken,
        "X-Requested-With": "XMLHttpRequest",
      },

      xhrFields: {
        withCredentials: true,
      },
      data: JSON.stringify({
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
      success: function (data) {
        $("[ids=editorPart_message]").text("Login Successful!!!");
        disableLoginErrorMsgs();
        setReportList(data.reportList);
        showLocaleList(data.isLocalized, data.localeList);
      },

      error: function (data) {
        enableReportSelectionErrorMsgs();
        if (data.status == 403) {
          $("[id$=reportErrorMessage]").text(
            "Please whitelist Client and Host application domain."
          );
        } else {
          sessionStorage, removeItem("oAuthTokenData");
          $("[id$-reportErrorMessage)").text("Error in fetching reports.");
        }
      },
    });
  }

  function setReportList(reportList) {
    $("[id$=reportList]").css("display", "block");
    $("[id$=reportList]").css("visibility", "visible");
    var reports = reportList.report;
    var count = 1;
    //Add reports to report list
    $.each(reports, function (key, value) {
      if ($("[ids=selectedReport_EDITOR]").val() == value.id) {
        $("[id$=reportList]").append(
          "<option value=" +
            count +
            "reportID=" +
            value.id +
            "type=" +
            value.reportType +
            "selected>" +
            value.entityTitle +
            "</option>"
        );
      } else {
        $("[id$=reportList]").append(
          "<option value=" +
            count +
            "reportID=" +
            value.id +
            "type" +
            value.reportType +
            ">" +
            value.entityTitle +
            "</option>"
        );
      }
      count++;
    });
    sortDropDownListByText();
  }

  function sortDropDownListByText() {
    var foption = $("[id$=reportList] option:first");
    $("[id$=reportList] option[value='Select Report']").remove();
    var selectedVal = $("[id$=reportList]").val();
    $("[id$=reportList]").html(
      $("[id$=reportList] option").sort(function (x, y) {
        return $(x).text().toUpperCase() < $(y).text().toUpperCase() ? -1 : 1;
      })
    );

    $("[id$=reportList)").val(selectedVal);
    $("[id$=reportList]").prepend(foption);
  }

  function showLocaleList(islocalized, localelist) {
    if (isLocalized == "true") {
      $("[id$=localelist]").css("display", "block");
      $("[id$=localelist]").css("visibility", "visible");

      for (var i = 0; i < localelist.length; i++) {
        if ($("[id$=selectedLocale_EDITOR]").val() == localelist[i]) {
          $("[id$=localeList]").append(
            "<option localeID=" +
              localeList[i] +
              "selected>" +
              localelist[i] +
              "<option>"
          );
        } else {
          $("[id$=localeList]").append(
            "<option localeID=" +
              localeList[i] +
              ">" +
              localelist[i] +
              "</option>"
          );
        }
      }
    } else {
      $("[id$=localelist]").css("display", "none");
      $("[id$=localelist]").css("visibility", "hidden");
      $("[id$=localelist]").empty();
      $("[id$=selectedLocale_EDITOR]").val("");
      $("[id$=localelist]").append(new Option("Select Locale", "0"));
    }
  }

  $(function () {
    // On report selection get Bl report integration URL

    $("[id$=reportList]").change(function () {
      disableReportSelectionErrorMsgs();
      generateURL(null);
    });

    //On locale selection get BI report integration URL with locale

    $("[id$=localeList]").change(function () {
      generateURL(this);
    });
  });

  function generateURL(e) {
    localeID = "";

    if (e) {
      localeID = $("[id$=localelist] option:selected").attr("localeID");
    }

    getID = $("[id$=reportList] option:selected").attr("reportID");

    getType = $("[id$=reportList] option:selected").attr("type");

    if ((localeID = undefined || localeID == "")) {
      $("[id$=BI_Report_Url_EDITOR]").val(
        $("[id$=URL_EDITOR]").val() +
          "/integration?reportId=" +
          getID +
          "&reportType=" +
          getType +
          "&applicationType=webparts&showLoginInPopUp=true"
      );
    } else {
      if (getID == undefined || getID == "") {
        enableReportSelectionErrorMsgs();
        $("[id$=localelist]").val(0).change();
        $("[id$=reportErrorMessage]").text("Please Select a Report first");
        return false;
      } else {
        $("[id$=BI_Report_Url_EDITOR]").val(
          $("[id$=URL_EDITOR)").val() +
            "/integration?reportId=" +
            getID +
            "&reportType=" +
            getType +
            "&lang=" +
            localeID +
            "&reportLocale=" +
            localeID +
            "&applicationType=webparts&showLoginInPopUp=true"
        );
      }
    }

    $("[id$=selectedReport_EDITOR)").val(getID);
    $("[id$=selectedLocale_EDITOR]").val(localeID);
  }

  $(function () {
    $("[id$=AppBtn], [id$=OKBtn]").click(function () {
      var selectedReport = $("[id$=reportList]").val();
      if (selectedReport == 0 && checkAuthentication == -1) {
        enableReportSelectionErrorMsgs();
        $("[id$=reportErrorMessage]").text("Please Select a Report");

        return false;
      }

      $("[id$=reportList]").empty();

      $("[id$=localelist]").empty();
    });
  });

  $(function () {
    $("[id$=BI_URL]").on("input", function () {
      $("[id$=URL_EDITOR]").val($(this).val());
    }),
      $("[id$=BI_URL]").on("change", function () {
        $("[id$=reportList]").empty();
        $("[id$=localelist]").empty();
        $("[id$=selectedReport_EDITOR)").val("");
        $("[id$=selectedLocale_EDITOR]").val("");
        $("[id$=reportList]").append(new Option("Select Report", "0"));
        $("[id$=localelist]").append(new Option("Select locale", "0"));
        $("[id$=editorPart_message]").text("");
      });
  });

  $(function () {
    $("[id$=login]").click(function () {
      $("[id$=reportList]").empty();
      $("[id$=reportList]").append(new Option("Select Report", "0"));

      $("[id$=localeList]").empty();

      $("[id$=localelist]").append(new Option("Select locale", "0"));

      checkForSessionStorage();

      $("[id$=BI_Report_Url_EDITOR]").val("");

      $("[id$=selectedReport_EDITOR]").val("");

      $("[id$=selectedLocale_EDITOR]").val("");

      if ($("[id$=URL_EDITOR]").val() == "") {
        enableLoginErrorMsgs();

        $("[id$=loginErrorMessage]").text("Please Enter BI URL");
      }
    });
  });

  $(function () {
    $("[id$=BI_URL]").val($("[id$=URL_EDITOR]").val());
    $(
      "[id$=TABLE_1_IMAGE], [id$=TABLE_1_ANCHOR], [id$=TABLE_1_IMAGEANCHOR]"
    ).hide();

    disableLoginErrorMsgs();

    disableReportSelectionErrorMsgs();
  });

  $(function () {
    $("[id$=CnclBtn]").click(function () {
      $("[id$=reportList]").empty();

      $("[ids=localelist]").empty();

      $("[id$=selectedReport_EDITOR]").val("");

      $("[id$=selectedLocale_EDITOR]").val("");
    });
  });

  function hideAllListBoxes() {
    $("[id$=reportList]").css("display", "none");

    $("[id$=reportList]").css("visibility", "hidden");

    $("[id$=localeList]").css("display", "none");

    $("[id$=localeList]").css("visibility", "hidden");

    $("[id$=sharePointLocaleReport]").css("display", "none");

    $("[id$=sharePointLocaleReport]").css("visibility", "hidden");
  }

  function enableLoginErrorMsgs() {
    $("[id$=loginErrorMessage]").css("display", "block");
    $("[id$-loginErrorMessage]").css("visibility", "visible");
  }
  function disableLoginErrorMsgs() {
    $("[id$=loginErrorMessage)").css("display", "none");

    $("[id$=loginErrorMessage]").css("visibility", "hidden");
  }
  function enableReportSelectionErrorsgs() {
    $("[id$=reportErrorMessage]").css("display", "block");
    $("[id$=reportErrorflessage]").css("visibility", "visible");
  }
  function disableReportSelectionErrorMsgs() {
    $("[id$=reportErrorflessage]").css("display", "none");
    $("[id$-reportErrorMessage]").css("visibility", "hidden");
  }
});
