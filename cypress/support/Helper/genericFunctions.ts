export default class GenericHepler {
  //check table cell
  static GenericCheckTableCell(expectValue: any[]) {
    cy.get(".content-wrapper")
      .find(".rgRow")
      .each(($row, rowIndex) => {
        cy.wrap($row)
          .find(".rgCell")
          .each(($cell, cellIndex) => {
            cy.wrap($cell)
              .invoke("text")
              .should("contain", expectValue[rowIndex][cellIndex]);
          });
      });
  }
  //check table row number
  static GenericCheckTableRowNumber(expectValue: number) {
    cy.get(".content-wrapper")
      .find(".rgRow")
      .then((row) => {
        expect(row.length).to.equal(expectValue);
      });
  }
  // check first header}
  static GenricCheckReportFirstHeader(expectValue: any[]) {
    cy.get(".header-wrapper")
      .find(".group-rgRow")
      .each((elem) => {
        cy.wrap(elem)
          .find(".rgHeaderCell")
          .each((cell, cellIndex) => {
            cy.wrap(cell)
              .invoke("text")
              .should("contain", expectValue[cellIndex]);
          });
      });
  }
  // check second header}
  static genricCheckReportSecondHeader(expectValue: any[]) {
    cy.get(".header-wrapper")
      .find(".actual-rgRow")
      .each((elem) => {
        cy.wrap(elem)
          .find(".rgHeaderCell")
          .each((cell, cellIndex) => {
            cy.wrap(cell)
              .invoke("text")
              .should("contain", expectValue[cellIndex]);
          });
      });
  }
  static validateTableRow(colomnHeader: any, expectedValue: any) {
    //find the index of the colomn depnds on the header lable
    cy.get(".oxd-table-header")
      .contains(colomnHeader)
      .invoke("index")
      .then((colomnIndex) => {
        //find all rows in  table body
        cy.get(".oxd-table-body")
          .find(".oxd-table-card")
          .each((elem) => {
            cy.wrap(elem)
              .find(".oxd-table-row")
              .find(".oxd-table-cell")
              .eq(colomnIndex)
              .invoke("text")
              .then((cell) => {
                if (cell.trim() == expectedValue.trim()) {
                  //expected the value in the row cell of index header , the test should pass
                  expect(
                    cell.trim(),
                    `found the row with ${colomnHeader} = ${expectedValue}`
                  ).to.equal(expectedValue.trim());
                }
              });
          });
      });
  }
}
