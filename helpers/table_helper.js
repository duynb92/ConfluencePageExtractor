function addTHeadToTables(xmlElements) {
	const allTables = xmlElements.filter((x) => x['table'] != null);
	allTables.forEach((table) => {
		addStyleToElement(
			table,
			'border-collapse: collapse; table-layout: fixed; margin-left: auto; margin-right: auto; width: 100%; border: 1px solid #99acc2;'
		);

		let tableElement = table['table'];
		let tBodies = tableElement.find((x) => x['tbody'] != null)['tbody'];
		let firstRow = tBodies[0]['tr'];

		let hasHeader = firstRow?.find((x) => x['th'] != null);
		if (hasHeader) {
			let tHead = { thead: firstRow };
			let colGroupIndex = tableElement.indexOf(
				tableElement.find((x) => x['colgroup'] != null)
			);
			tableElement.splice(colGroupIndex + 1, 0, tHead);
			tBodies.splice(0, 1);
		}

		// Add style to td and th elements in each row
		updateStyleTBodies(tBodies);
	});
}

function updateStyleTBodies(tBodies) {
	if (!Array.isArray(tBodies)) {
		return;
	}
	for (let row of tBodies) {
		if (!row['tr']) {
			continue;
		}
		for (let cell of row['tr']) {
			if (cell['td']) {
				addStyleToElement(
					cell,
					'padding: 4px; text-align: center; border-width: 1px; border-style: solid;'
				);
				// Replace p tag with span in td
				cell['td'].forEach((td) => {
					if (td['p']) {
						replacePWithSpan(td);
					}
				});
			}
			if (cell['th']) {
				addStyleToElement(
					cell,
					'padding: 4px; text-align: center; border-width: 1px; border-style: solid; background-color: #0600ff; color: white;'
				);
				let tagPinTh = cell['th'].find((x) => x['p'] != null);
				addStyleToElement(tagPinTh, 'color: white;');
				replacePWithSpan(tagPinTh);
			}
		}
	}
}

function replacePWithSpan(cell) {
	if (cell['p']) {
		const pContent = cell['p'][0];
		cell['span'] = [{ ...pContent }];
		delete cell['p'];
	}
}

function addStyleToElement(element, style) {
	if (!element[':@']) {
		element[':@'] = {};
	}
	element[':@']['style'] = style;
}

module.exports = {
	addTHeadToTables: addTHeadToTables,
};