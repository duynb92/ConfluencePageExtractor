function stripHtmlTags(input) {
    return input.replace(/<\/?[^>]+(>|$)/g, "")
}

function checkHyperlinks(input) {
    return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(input)
}

function containsVietnameseCharacter(str) {
	const regex = /^[a-zA-Z0-9\s_.-]+$/;
	const isNormalTone = regex.test(str);
	return !isNormalTone;
}

module.exports = {
	stripHtmlTags: stripHtmlTags,
	checkHyperlinks: checkHyperlinks,
	containsVietnameseCharacter: containsVietnameseCharacter,
};
