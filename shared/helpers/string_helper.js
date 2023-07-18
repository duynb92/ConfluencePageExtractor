function stripHtmlTags(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}

function checkHyperlinks(input) {
  return new RegExp(
    "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"
  ).test(input);
}

module.exports = {
  stripHtmlTags,
  checkHyperlinks,
};
