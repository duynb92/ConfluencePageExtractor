function replaceAcImage(folderName, acImage, attachments) {
  let attachmentAttributes = acImage['ac:image'][0][':@'];
  let imageAttributes = acImage[':@'];
  let fileName = attachmentAttributes['@_ri:filename'];
  let url = generateHubSpotImageUrl(folderName, fileName);
  let attachmentId = attachments.find(x => x.title == fileName).id;
  let width = imageAttributes['@_ac:width'] ? imageAttributes['@_ac:width'] : imageAttributes['@_ac:original-width'];
  let height = imageAttributes['@_ac:height'] ? imageAttributes['@_ac:height'] : imageAttributes['@_ac:original-height'];
  let altText = imageAttributes['@_ac:alt'] ? imageAttributes['@_ac:alt'] : fileName.replace(/\.[^/.]+$/, "")
  return {
    'p': [
      {
        'img': [],
        ':@': {
          '@_confluenceAttachmentId': attachmentId,
          '@_src': url,
          '@_alt': altText,
          '@_width': width,
          '@_height': height,
          '@_loading': 'lazy',
          '@_style': `height: auto; max-width: 100%; width: ${width}px;`
        }
      }
    ],
  }
}

// TODO: how to remove hard-code?
function generateHubSpotImageUrl(folderName, fileName) {
  return `https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/Blogs/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`
}

function replaceAcImages(folderName, elements, attachments) {
  var results = []
  let acImages = elements.filter(x => x['ac:image'] != null);
  if (acImages.length > 0) {
    acImages.forEach(acImage => {
      let p = replaceAcImage(folderName, acImage, attachments);
      let index = elements.indexOf(acImage);
      if (index !== -1) {
        elements[index] = p;
      }
    });
    results.push(...acImages);
  }
  elements.forEach(element => {
    let key = Object.keys(element)[0];
    if (Array.isArray(element[key])) {
      results.push(...replaceAcImages(folderName, element[key], attachments));
    }
  })
  return results;
}

function replaceAcEmoticons(folderName, elements, attachments) {
  var results = []
  let acEmoticons = elements.filter(x => x['ac:emoticon'] != null);
  if (acEmoticons.length > 0) {
    acEmoticons.forEach(acEmoticon => {
      let emoji = acEmoticon[':@']['@_ac:emoji-fallback'];
      let index = elements.indexOf(acEmoticon);
      if (index !== -1) {
        elements[index] = { '#text': emoji };
      }
    });
    results.push(...acEmoticons);
  }
  elements.forEach(element => {
    let key = Object.keys(element)[0];
    if (Array.isArray(element[key])) {
      results.push(...replaceAcEmoticons(folderName, element[key], attachments));
    }
  })
  return results;
}

module.exports = {
  replaceAcImages: replaceAcImages,
  replaceAcEmoticons: replaceAcEmoticons,
  generateHubSpotImageUrl: generateHubSpotImageUrl
}