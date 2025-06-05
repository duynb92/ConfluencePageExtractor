// Constants for styling
const TABLE_HEADER_STYLES = {
	CELL: 'padding: 4px; text-align: center; border-width: 1px; border-style: solid; background-color: #0600ff;',
	TEXT: 'color: white;',
	BODY_CELL: 'padding: 4px; border-width: 1px; border-style: solid;',
};

function addTHeadToTables(xmlElements) {
	const allTables = xmlElements.filter((x) => x['table'] != null);
	allTables.forEach((table) => {
		addStyleToElement(
			table,
			'border-collapse: collapse; table-layout: fixed; margin-left: auto; margin-right: auto; border: 1px solid #99acc2;'
		);

		let tableElement = table['table'];
		let tBodies = tableElement.find((x) => x['tbody'] != null)['tbody'];
		let firstRow = tBodies[0]['tr'] || tBodies[1]['tr'];

		let hasHeader = firstRow?.find((x) => x['th'] != null);
		if (hasHeader) {
			addStyleToTHead(firstRow);
			let tHead = { thead: firstRow };
			let colGroupIndex = tableElement.indexOf(
				tableElement.find((x) => x['colgroup'] != null)
			);
			if (tBodies[0]['tr'] && !tBodies[1]['tr']) {
				tableElement.splice(colGroupIndex + 1, 0, tHead);
				tBodies.splice(0, 1);
			}
			if (tBodies[1]['tr'] && !tBodies[0]['tr']) {
				tableElement.splice(colGroupIndex + 1, 0, tHead);
				tBodies.splice(1, 1);
			}
		}

		// Add style to td and th elements in each row
		updateStyleTBodies(tBodies);
	});
}

function addStyleToTHead(rows) {
	if (!Array.isArray(rows)) {
		return;
	}

	rows.forEach((cell) => {
		if (!cell.th) {
			return;
		}

		// Apply header cell styling
		addStyleToElement(cell, TABLE_HEADER_STYLES.CELL);

		// Find and style paragraph element within header
		const headerParagraph = cell.th.find((element) => element.p != null);
		if (headerParagraph) {
			replacePWithSpan(headerParagraph);
			addStyleToElement(headerParagraph, TABLE_HEADER_STYLES.TEXT);
		}
	});
}

function updateStyleTBodies(tBodies) {
	if (!Array.isArray(tBodies)) {
		return;
	}

	tBodies.forEach((row) => {
		if (!row.tr) {
			return;
		}

		row.tr.forEach((cell) => {
			if (!cell.td) {
				return;
			}

			// Apply table cell styling
			addStyleToElement(cell, TABLE_HEADER_STYLES.BODY_CELL);

			// Process single-item table cells
			cell.td.forEach((td) => {
				const isSingleParagraphCell = Object.keys(td).length <= 2 && td.p;
				if (isSingleParagraphCell) {
					removeP(td, cell);
				}
			});
		});
	});
}

function removeP(cell, parent) {
	if (!cell.p) {
		return;
	}

	const paragraphContent = cell.p[0];

	// Transfer content and attributes
	cell['#text'] = paragraphContent['#text'] || '';
	cell[':@'] = {
		...cell[':@'],
		...paragraphContent[':@'],
	};
	delete cell.p;

	// Combine styles
	const combinedStyle = parent[':@']['@_style'] + (cell[':@']['@_style'] || '');
	addStyleToElement(parent, combinedStyle);
}

function replacePWithSpan(cell) {
	if (!cell?.p) {
		return;
	}

	const paragraphContent = cell.p[0];
	cell.span = [{ ...paragraphContent }];
	delete cell.p;

	addStyleToElement(
		cell,
		'padding: 4px; text-align: center; border-width: 1px; border-style: solid;'
	);
}

function addStyleToElement(element, style) {
	if (!element) {
		return;
	}

	element[':@'] = element[':@'] || {};
	element[':@']['@_style'] = style;
}

module.exports = {
	addTHeadToTables: addTHeadToTables,
};
