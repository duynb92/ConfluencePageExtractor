const { generateHubSpotMediaUrl } = require('./url_helper');
const { videoExtension } = require('./utils');

function replaceEmbeddedVideo(folderName, element) {
	let attributes = element[':@'];
	let urlFromAttr = attributes['@_href']?.replace('watch?v=', 'embed/');
	let fileName = attributes['@_ac:alt'];
	let urlFromFilename = generateHubSpotMediaUrl(folderName, fileName);
	let url = urlFromAttr || urlFromFilename;
	let width = attributes['@_data-original-width'];
	return {
		div: [
			{
				div: [
					{
						div: [
							{
								iframe: [],
								':@': {
									'@_width': 200,
									'@_height': 113,
									'@_src': url,
									'@_frameborder': 0,
									'@_allow':
										'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
									'@_style':
										'position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: none;',
								},
							},
						],
						':@': {
							'@_style':
								'position: relative; overflow: hidden; max-width: 100%; padding-bottom: 56.5%; margin: 0px;',
						},
					},
				],
				':@': {
					'@_class': 'hs-embed-content-wrapper',
				},
			},
		],
		':@': {
			'@_class': 'hs-embed-wrapper',
			'@_data-service': 'youtube',
			'@_data-responsive': 'true',
			'@_style': `position: relative; overflow: hidden; width: 100%; height: auto; padding: 0px; max-width: ${width}; min-width: 256px; display: block; margin: auto;`,
		},
	};
}

function replaceEmbeddedVideos(folderName, elements) {
	var results = [];
	let embedVideos = elements.filter((x) => {
		if (
			x[':@'] &&
			videoExtension.some((ext) => x[':@']['@_ac:alt']?.includes(ext))
		) {
			return true;
		}
		if ((x['a'] != null && x[':@']['@_data-card-appearance']) == 'embed') {
			return true;
		}
		return false;
	});
	if (embedVideos.length > 0) {
		embedVideos.forEach((embedVideo) => {
			let div = replaceEmbeddedVideo(folderName, embedVideo);
			let index = elements.indexOf(embedVideo);
			if (index !== -1) {
				elements[index] = div;
			}
		});
		results.push(...embedVideos);
	}
	elements.forEach((element) => {
		let key = Object.keys(element)[0];
		if (Array.isArray(element[key])) {
			results.push(...replaceEmbeddedVideos(folderName, element[key]));
		}
	});
	return results;
}

module.exports = {
	replaceEmbeddedVideos: replaceEmbeddedVideos,
};
