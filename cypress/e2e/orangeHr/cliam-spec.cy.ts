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
import moment from "moment";
const loginObj: login = new login();
export let eventTitle: string;
export let reportName: string;
export let exspensName: string;
let idEvent: any;
let idExpenses: any;
let empNumber: number; //store employeeNumber retrieve from API
let idClaim: any;
let userName: string;
let referenceId: any;
let status: any;
let amount = "100.00";
let date = "2023-11-29";
let currencyId = "AFN";
let currencyName = "Afghanistan Afghani";
let expectValue: any;
var formattedDate = moment().format("YYYY-MM-DD");
console.log(formattedDate);

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
    eventTitle = empInfo[2].eventTitle;
    exspensName = empInfo[2].expenseName;
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
      })
      .then(() => {
        cy.logout();
        loginObj.loginValid(userName, "123456a");
        cy.visit("/claim/submitClaim");
        addClaim(idEvent, currencyId).then((res) => {
          idClaim = res.body.data.id;
          referenceId = res.body.data.referenceId;
          addClaimExpenses(idExpenses, idClaim, formattedDate, amount);
          submitClaim(idClaim);
        });
      })
      .then(() => {
        cy.logout();
      });
    // }
  });
});

describe("Cliam functionality", () => {
  it("Cliam: verify admin can approve submited cliam user )", () => {
    status = "Paid";
    expectValue = [
      referenceId,
      "alaa12 abuhani",
      eventTitle,
      "",
      currencyName,
      formattedDate,
      status,
      amount,
      " View Details ",
    ];
    visitHomePage();
    cy.fixture("login.json").as("loginInfo");
    cy.get("@loginInfo").then((loginInfo: any) => {
      loginObj.loginValid(loginInfo.Admin, loginInfo.Password);
    });
    cy.visit("/claim/viewAssignClaim");
    cy.visit(`/claim/assignClaim/id/${idClaim}`);
    cy.get(".oxd-button--secondary").click({ force: true });
    cy.visit("/claim/viewAssignClaim");
    cy.get(".oxd-table-body")
      .find(".oxd-table-card")
      .find(".oxd-table-row")
      .contains(`${referenceId}`)
      .invoke("index")
      .as("indexTargetRow")
      .then((indexrow) => {
        cy.get(".oxd-table-body")
          .find(".oxd-table-card")
          .find(".oxd-table-row")
          .eq(indexrow)
          .each((elem) => {
            cy.wrap(elem)
              .find(".oxd-table-cell")
              .each((cell, cellIndex) => {
                cy.wrap(cell)
                  .invoke("text")
                  .should("contain", expectValue[cellIndex]);
              });
          });
      });
  });

  it("Cliam: verify admin can reject submited cliam user)", () => {
    status = "Rejected";
    expectValue = [
      referenceId,
      "alaa12 abuhani",
      eventTitle,
      "",
      currencyName,
      formattedDate,
      status,
      amount,
      " View Details ",
    ];
    visitHomePage();
    cy.fixture("login.json").as("loginInfo");
    cy.get("@loginInfo").then((loginInfo: any) => {
      loginObj.loginValid(loginInfo.Admin, loginInfo.Password);
    });
    cy.visit("/claim/viewAssignClaim");
    cy.visit(`/claim/assignClaim/id/${idClaim}`);

    cy.get(".oxd-button--danger").click({ force: true });
    cy.visit("/claim/viewAssignClaim");
    cy.get(".oxd-table-body")
      .find(".oxd-table-card")
      .find(".oxd-table-row")
      .contains(`${referenceId}`)
      .invoke("index")
      .as("indexTargetRow")
      .then((indexrow) => {
        cy.get(".oxd-table-body")
          .find(".oxd-table-card")
          .find(".oxd-table-row")
          .eq(indexrow)
          .each((elem) => {
            cy.wrap(elem)
              .find(".oxd-table-cell")
              .each((cell, cellIndex) => {
                cy.wrap(cell)
                  .invoke("text")
                  .should("contain", expectValue[cellIndex]);
              });
          });
      });
  });
});

afterEach(() => {
  deleteEmployee(empNumber);
  deleteExpenses(idExpenses);
  deleteEvents(idEvent);
});
