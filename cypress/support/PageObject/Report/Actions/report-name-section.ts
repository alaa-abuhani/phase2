import { reportName } from "../../../../e2e/orangeHr/cliam-spec.cy";
export default class ReportName {
  elements = {
    inputName: () => cy.get(".oxd-input--active").eq(1),
  };
  getInputNameReport() {
    this.elements.inputName().type(reportName);
  }
}
