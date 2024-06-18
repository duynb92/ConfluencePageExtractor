function replaceAcImage(folderName, acImage, attachments) {
  let attachmentAttributes = acImage['ac:image'][0][':@'];
  let imageAttributes = acImage[':@'];
  let fileName = attachmentAttributes['@_ri:filename'];
  const fileNameWithoutTones = removeVietnameseTones(fileName);
  let url = generateHubSpotImageUrl(folderName, fileNameWithoutTones);
  let attachmentId = attachments.find(x => x.title == fileNameWithoutTones).id;
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


function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,"-");
  str = str.replace(/\s/g, '-')
  return str;
}

module.exports = {
  replaceAcImages: replaceAcImages,
  replaceAcEmoticons: replaceAcEmoticons,
  generateHubSpotImageUrl: generateHubSpotImageUrl,
  removeVietnameseTones: removeVietnameseTones
}