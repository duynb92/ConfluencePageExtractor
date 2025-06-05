function generateHubSpotMediaUrl(folderName, fileName) {
	return `https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/Blogs/${encodeURIComponent(
		folderName
	)}/${encodeURIComponent(fileName)}`;
}

module.exports = {
	generateHubSpotMediaUrl: generateHubSpotMediaUrl,
};