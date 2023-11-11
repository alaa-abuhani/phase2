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
          addClaimExpenses(idExpenses, idClaim, formattedDate, amount);
          submitClaim(idClaim);
        });
      })
      .then(() => {
        cy.logout();
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
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewAssignClaim"
    );
    cy.visit(
      `https://opensource-demo.orangehrmlive.com/web/index.php/claim/assignClaim/id/${idClaim}`
    );
    cy.get(".oxd-button--secondary").click({ force: true });
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewAssignClaim"
    );
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
    // static validateTableRow(colomnHeader: any, expectedValue: any) {
    //find the index of the colomn depnds on the header lable
    // let i = 1;
    // let q = 1;
    // let w = 1;
    // cy.get(".oxd-table-header")
    //   .contains("Reference Id")
    //   .invoke("index")
    //   .then((colomnIndex) => {
    //     //find all rows in  table body
    //     cy.log(
    //       "index cokume index ",
    //       `${colomnIndex}`,
    //       `redf is${referenceId}`,
    //       `i ==`,
    //       i++
    //     );
    //     cy.get(".oxd-table-body")
    //       .find(".oxd-table-card")
    //       .each((elem) => {
    //         cy.log("element", `${elem}`, "wwwwwwwww", w++);
    //         cy.wrap(elem)
    //           .find(".oxd-table-row")
    //           .find(".oxd-table-cell")
    //           .eq(colomnIndex)
    //           .invoke("text")
    //           .then((cell) => {
    //             cy.log("cell", `${cell}`, "qqqqqqq", q++);
    //             if (cell.trim() === `${referenceId}`.trim()) {
    //               //expected the value in the row cell of index header , the test should pass
    //               expect(
    //                 cell.trim(),
    //                 `found the row with = ${referenceId}`
    //               ).to.equal(`${referenceId}`.trim());
    //             }
    //           });
    //       });
    //   });
    // let expectValue = [
    //   `${referenceId}`,
    //   `${userName}`,
    //   "Event Name",
    //   "Currency",
    //   "Submitted Date",
    //   "Status",
    //   "Amount ",
    // ];
    // cy.get(".oxd-table-body")
    //   .find(".oxd-table-card")
    //   .find(".oxd-table-row")
    //   .each(($row, rowIndex) => {
    //     cy.wrap($row)
    //       .find(".oxd-table-cell")
    //       .each(($cell, cellIndex) => {
    //         cy.wrap($cell)
    //           .invoke("text")
    //           .should("contain", expectValue[rowIndex][cellIndex]);
    //       });
    //   });
    // }
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
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewAssignClaim"
    );
    cy.visit(
      `https://opensource-demo.orangehrmlive.com/web/index.php/claim/assignClaim/id/${idClaim}`
    );

    cy.get(".oxd-button--danger").click({ force: true });
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewAssignClaim"
    );
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

// let i = 1;
//     let q = 1;
//     let w = 1;
//     cy.get(".oxd-table-header")
//       .contains("Reference Id")
//       .invoke("index")
//       .then((colomnIndex) => {
//         //find all rows in  table body
//         cy.log(
//           "index cokume index ",
//           `${colomnIndex}`,
//           `redf is${referenceId}`,
//           `i ==`,
//           i++
//         );
//         cy.get(".oxd-table-body")
//           .find(".oxd-table-card")
//           .each((elem) => {
//             cy.log("element", `${elem}`, "wwwwwwwww", w++);
//             cy.wrap(elem)
//               .find(".oxd-table-row")
//               .find(".oxd-table-cell")
//               .eq(colomnIndex)
//               .invoke("text")
//               .then((cell) => {
//                 cy.log("cell", `${cell}`, "qqqqqqq", q++);
//                 if (cell.trim() === `${referenceId}`.trim()) {
//                   //expected the value in the row cell of index header , the test should pass
//                   expect(
//                     cell.trim(),
//                     `found the row with = ${referenceId}`
//                   ).to.equal(`${referenceId}`.trim());
//                 }
//               });
//           });
//       });

// export const checkDataInTable = (tableSelector: string, rowsData: any[]) => {
//   cy.get(tableSelector,{timeout:40000}).find('.rgRow',{timeout:40000}).should('have.length.gt', 0).each(($row :string, rowIndex :number) => {
//       if (rowIndex < rowsData.length) {
//           const rowData = rowsData[rowIndex];
//           let allDataFound = true;
//           cy.get($row,{timeout:40000}).find('.rgCell',{timeout:40000}).each(($cell, cellIndex) => {
//               cy.wrap($cell).invoke('text').then((cellText) => {
//                   const cellTextLower = cellText.trim().toLowerCase();
//                   const expectedData = rowData[cellIndex] ? rowData[cellIndex].toString().toLowerCase().trim() : '';

//                   if (!cellTextLower.includes(expectedData)) {
//                       allDataFound = false;
//                   }
//               });
//           });
//           cy.wrap($row).then(() => {
//               if (allDataFound) {
//                   cy.log(`All data found in row ${rowIndex + 1}`);
//               } else {
//                   cy.log(`Data not found in row ${rowIndex + 1}`);
//               }
//           });
//       }
//   });
// };
////////================
