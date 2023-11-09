import login from "../../support/PageObject/login";
import {
  addEmployee,
  addEvent,
  addExpenses,
  addUser,
  deleteEmployee,
  deleteExpenses,
  deleteEvents,
} from "../../support/Helper/api-helper";
import { visitHomePage } from "../../support/PageObject/common-page-visit";
const loginObj: login = new login();
export let eventTitle: string;
export let reportName: string;
let firstHeaderData: any; // store the values of first header table for Assertion
let secondHeaderData: any; // store the values of second header table for Assertion
export let exspensName: string;
let tableData: any; // array of data use for Assertion  report table cell
let tableRowNumber: number; // number row of report table use it for Assertion
let idEvent: any;
let idExpenses: any;
let empNumber: number[] = []; //store employeeNumber retrieve from API
let employees: any[] = []; // store employee firstName use it  for Assertion table
let idClaim: any;
let userName: string;
let referenceId: any;
let status: any;
let amount = "100.00";
let date = "2023-11-29";

beforeEach(() => {
  cy.intercept("/web/index.php/dashboard/index").as("loginpage");
  visitHomePage();
  //admin login
  cy.fixture("login.json").as("loginInfo");
  cy.get("@loginInfo").then((loginInfo: any) => {
    loginObj.loginValid(loginInfo.Admin, loginInfo.Password);
  });
  cy.fixture("employeeInfo.json").as("empInfo");
  cy.get("@empInfo").then((empInfo: any) => {
    eventTitle = empInfo[2].eventTitle + Math.round(1000 * Math.random());
    exspensName = empInfo[2].expenseName + Math.round(1000 * Math.random());
    //greate event via api
    addEvent(eventTitle).then((id) => {
      idEvent = id;
      console.log(idEvent);
    });
    //greate expenses via api
    addExpenses(exspensName).then((id) => {
      idExpenses = id;
    });
    //greate one employee via api and assign for that job &location & salary
    addEmployee(empInfo[0].firstName, empInfo[0].id, empInfo[0].lastName)
      .then((empNum) => {
        // store employee Number
        empNumber.push(empNum);
      })
      .then((empNum) => {
        userName = empInfo[0].userName + Math.round(10000 * Math.random());
        employees.push(userName);
        addUser(empNum, userName, empInfo[0].password);
        cy.log(
          "username:",
          userName,
          "event",
          eventTitle,
          "expens",
          exspensName
        );
      })
      .then(() => {
        cy.log("user one", employees[0]);
        cy.logout();
        loginObj.loginValid(employees[0], "123456a");
        cy.visit("/claim/submitClaim");
        cy.request({
          method: "POST",
          url: "/api/v2/claim/requests",
          body: {
            claimEventId: idEvent,
            currencyId: "AFN",
            remarks: null,
          },
        }).then((res) => {
          console.log("res");
          cy.log(`${res} &&claim/requests `);
          idClaim = res.body.data.id;
          referenceId = res.body.data.id.referenceId;

          cy.log(`${idClaim}`);
          cy.request({
            method: "POST",
            url: `/api/v2/claim/requests/${idClaim}/expenses`,
            body: {
              expenseTypeId: idExpenses,
              date: date,
              amount: amount,
              note: null,
            },
          })
            .then((res) => {
              cy.log(`${res} ## claim/requests/${idClaim}/expenses `);
              cy.request({
                method: "PUT",
                url: `/api/v2/claim/requests/${idClaim}/action`,
                body: {
                  action: "SUBMIT",
                },
              });
            })
            .then((res) => {
              status = res.body.data.status;
              cy.log(`${status}`);
            });
        });
      });
    // }
  });
  // cy.log("user one", employees[0]);
  // cy.log("user two", employees[1]);
  // cy.logout();
  // loginObj.loginValid(employees[0], "123456a");
  // cy.request({
  //   method: "POST",
  //   url: "https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/claim/requests",
  //   body: {
  //     claimEventId: idEvent,
  //     currencyId: "AFN",
  //     remarks: null,
  //   },
  // }).then((res) => {
  //   console.log(res, "aftercalim user ");
  //   cy.request({
  //     method: "POST",
  //     url: `
  // https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/claim/requests/res.body.data.id/expenses`,
  //     body: {
  //       expenseTypeId: idExpenses,
  //       date: "2023-11-13",
  //       amount: "100.00",
  //       note: null,
  //     },
  //   });
  // });

  // tableData = [
  //   [employees[0], jobTitle, salaryAmount],
  //   [employees[1], jobTitle, salaryAmount],
  //   [employees[2], jobTitle, salaryAmount],
  // ];
  tableRowNumber = employees.length;

  // store data of report from fixture use this data for create report and Assertion
  // cy.fixture("report.json").as("reportInfo");
  // cy.get("@reportInfo").then((reportInfo: any) => {
  //   reportName = reportInfo.reportName;
  //   firstHeaderData = reportInfo.firstHeaderData;
  //   secondHeaderData = reportInfo.secondHeaderData;
  // });
});

describe("Report functionality", () => {
  it("Report: Generate an Employee report with search criteria Personal,Job,Salary)", () => {
    // visitHomePage();
    // //open PIM Tab & Report page UI
    // AddReport.ReportDialoge();
    // //execute functions create report UI
    // AddReport.AddReportActions();
    // //execute functions assertion report data
    // checkReportAssetrion(
    //   reportName,
    //   firstHeaderData,
    //   secondHeaderData,
    //   tableData,
    //   tableRowNumber
    // );
  });
});

afterEach(() => {
  //delete all employee
  // for (let i = 0; i < 3; i++) {
  //   deleteEmployee(empNumber[i]);
  // }
  // //delete job
  // deleteJob(idjob);
  // //delete location
  // deleteLocation(idloc);
});
