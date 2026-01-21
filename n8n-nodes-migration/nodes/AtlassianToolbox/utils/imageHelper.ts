import { generateHubSpotMediaUrl } from './urlHelper';
import { videoExtension } from './constants';

export function replaceAcImage(folderName: string, acImage: any, attachments: any[]) {
    const attachmentAttributes = acImage['ac:image'][0][':@'];
    const imageAttributes = acImage[':@'];
    const fileName = attachmentAttributes['@_ri:filename'];
    const url = generateHubSpotMediaUrl(folderName, fileName);
    const attachmentId = attachments.find((x) => x.title === fileName)?.id;
    const width = imageAttributes['@_ac:width']
        ? imageAttributes['@_ac:width']
        : imageAttributes['@_ac:original-width'];
    const height = imageAttributes['@_ac:height']
        ? imageAttributes['@_ac:height']
        : imageAttributes['@_ac:original-height'];
    const altText = imageAttributes['@_ac:alt']
        ? imageAttributes['@_ac:alt']
        : fileName?.replace(/\.[^/.]+$/, '');
    return {
        p: [
            {
                img: [],
                ':@': {
                    '@_confluenceAttachmentId': attachmentId,
                    '@_src': url,
                    '@_alt': altText,
                    '@_width': width,
                    '@_height': height,
                    '@_loading': 'lazy',
                    '@_style': `height: auto; max-width: 100%; width: ${width}px;`,
                },
            },
        ],
    };
}

export function replaceAcImages(folderName: string, elements: any[], attachments: any[]): any[] {
    const results: any[] = [];
    const acImages = elements.filter((x) => {
        if (x[':@'] && videoExtension.some((ext) => x[':@']['@_ac:alt']?.includes(ext))) {
            return false;
        }
        if (x['ac:image']) {
            return true;
        }
        return false;
    });

    if (acImages.length > 0) {
        acImages.forEach((acImage) => {
            const p = replaceAcImage(folderName, acImage, attachments);
            const index = elements.indexOf(acImage);
            if (index !== -1) {
                elements[index] = p;
            }
        });
        results.push(...acImages);
    }
    elements.forEach((element) => {
        const key = Object.keys(element)[0];
        if (Array.isArray(element[key])) {
            results.push(...replaceAcImages(folderName, element[key], attachments));
        }
    });
    return results;
}

export function replaceAcEmoticons(folderName: string, elements: any[], attachments: any[]): any[] {
    const results: any[] = [];
    const acEmoticons = elements.filter((x: any) => x['ac:emoticon'] != null);
    if (acEmoticons.length > 0) {
        acEmoticons.forEach((acEmoticon: any) => {
            const emoji = acEmoticon[':@']['@_ac:emoji-fallback'];
            const index = elements.indexOf(acEmoticon);
            if (index !== -1) {
                elements[index] = { '#text': emoji };
            }
        });
        results.push(...acEmoticons);
    }
    elements.forEach((element) => {
        const key = Object.keys(element)[0];
        if (Array.isArray(element[key])) {
            results.push(...replaceAcEmoticons(folderName, element[key], attachments));
        }
    });
    return results;
}
