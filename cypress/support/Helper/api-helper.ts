import {
  employeeData,
  eventData,
  ExpensesData,
  userData,
} from "./payload-function";

const baseUrl = Cypress.config().baseUrl;
export const URLs: any = {
  employee: `${baseUrl}/api/v2/pim/employees`,
  user: `${baseUrl}/api/v2/admin/users`,
  events: `${baseUrl}/api/v2/claim/events`,
  expenses: `${baseUrl}/api/v2/claim/expenses/types`,
  jobDetails: `${baseUrl}/api/v2/admin/locations`,
  jobDelete: `${baseUrl}/api/v2/admin/job-titles`,
  employeeDelete: `${baseUrl}/api/v2/pim/employees`,
  locationDelete: `${baseUrl}/api/v2/admin/locations`,
};
export const addEvent = (eventName: any) => {
  return cy
    .api({ method: "POST", url: URLs.events, body: eventData(eventName) })
    .then((res) => res.body.data.id);
};

export const addExpenses = (expensesName: any) => {
  return cy
    .api({
      method: "POST",
      url: URLs.expenses,
      body: ExpensesData(expensesName),
    })
    .then((res) => res.body.data.id);
};

export const addEmployee = (
  firstName: string,
  id: string,
  lastName: string
) => {
  return cy
    .AddNewEmployee(URLs.employee, employeeData(firstName, id, lastName))
    .then((res) => res.body.data.empNumber);
};
export const addUser = (empNum: any, userName: any, password: any) => {
  cy.api({
    method: "POST",
    url: URLs.user,
    body: userData(empNum, userName, password),
  });
};
export const addClaim = (idEvent: any, currencyId: any) => {
  return cy
    .request({
      method: "POST",
      url: "/api/v2/claim/requests",
      body: {
        claimEventId: idEvent,
        currencyId: currencyId,
        remarks: null,
      },
    })
    .then((res) => res);
};
export const addClaimExpenses = (
  idExpenses: any,
  idClaim: number,
  date: any,
  amount: any
) => {
  cy.request({
    method: "POST",
    url: `/api/v2/claim/requests/${idClaim}/expenses`,
    body: {
      expenseTypeId: idExpenses,
      date: date,
      amount: amount,
      note: null,
    },
  });
};
export const submitClaim = (idClaim: any) => {
  cy.request({
    method: "PUT",
    url: `/api/v2/claim/requests/${idClaim}/action`,
    body: {
      action: "SUBMIT",
    },
  });
};

export const deleteEmployee = (empNumber: any) => {
  cy.api({
    method: "DELETE",
    url: URLs.employeeDelete,
    body: {
      ids: [empNumber],
    },
  });
};
export const deleteExpenses = (expensesId: any) => {
  cy.api({
    method: "DELETE",
    url: "/api/v2/claim/expenses/types",
    body: {
      ids: [expensesId],
    },
  });
};
export const deleteEvents = (eventId: any) => {
  cy.api({
    method: "DELETE",
    url: "/api/v2/claim/events",
    body: {
      ids: [eventId],
    },
  });
};
