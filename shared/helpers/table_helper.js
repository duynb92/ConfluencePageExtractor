function addTHeadToTables(xmlElements) {
  const allTables = xmlElements.filter((x) => x["table"] != null);
  allTables.forEach((table) => {
    let tableElement = table["table"];
    let tBodies = tableElement.find((x) => x["tbody"] != null)["tbody"];
    let firstRow = tBodies[0]["tr"];
    let hasHeader = firstRow.find((x) => x["th"] != null);
    if (hasHeader) {
      let tHead = { thead: firstRow };

      // Insert thead right after colgroup
      let colGroupIndex = tableElement.indexOf(
        tableElement.find((x) => x["colgroup"] != null)
      );
      tableElement.splice(colGroupIndex + 1, 0, tHead);

      // Remove first row from tBodies
      tBodies.splice(0, 1);
    }
  });
}

module.exports = {
  addTHeadToTables,
};
