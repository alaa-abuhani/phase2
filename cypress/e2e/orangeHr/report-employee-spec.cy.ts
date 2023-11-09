import login from "../../support/PageObject/login";
import {
  addEmployee,
  addEvent,
  addExpenses,
  addUser,
  deleteEmployee,
  deleteExpenses,
  deleteEvents,
  addClaim,
  addClaimExpenses,
  submitClaim,
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
let empNumber: number; //store employeeNumber retrieve from API
let employees: any[] = []; // store employee firstName use it  for Assertion table
let idClaim: any;
let userName: string;
let referenceId: any;
let status: any;
let amount = "100.00";
let date = "2023-11-29";
let currencyId = "AFN";

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
        empNumber = empNum;
      })
      .then((empNum) => {
        userName = empInfo[0].userName + Math.round(10000 * Math.random());
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
        cy.log("user one", userName);
        cy.logout();
        loginObj.loginValid(userName, "123456a");
        cy.visit("/claim/submitClaim");
        addClaim(idEvent, currencyId).then((res) => {
          console.log("res");
          idClaim = res.body.data.id;
          referenceId = res.body.data.referenceId;
          cy.log(`${referenceId}`);
          cy.log(`${idClaim}`);
          addClaimExpenses(idExpenses, idClaim, date, amount);
          submitClaim(idClaim);
        });
      });
    // }
  });

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
    cy.logout();
    visitHomePage();
    cy.fixture("login.json").as("loginInfo");
    cy.get("@loginInfo").then((loginInfo: any) => {
      loginObj.loginValid(loginInfo.Admin, loginInfo.Password);
    });

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
  // deleteEmployee(empNumber);
  // deleteExpenses(idExpenses);
  // deleteEvents(idEvent);
});
