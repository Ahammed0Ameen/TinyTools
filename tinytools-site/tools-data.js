/* Shared tool data. Used by build.mjs (Node) and by the browser for search. */
const IC = {
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  resize: '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h3v3h3M14 20h2"/>',
  pdf: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 14h6M10 17h4"/>',
  text: '<path d="M5 6h14M5 11h14M5 16h9"/>',
  percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/>',
  unit: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
};
const ico = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

const CATS = ['Images', 'PDF', 'Text', 'Calculators', 'Converters', 'Generators'];
const TOOLS = [
  { id: 'image-compressor', name: 'Image Compressor', cat: 'Images', icon: 'image', desc: 'Shrink image file sizes in your browser.',
    seo: 'Compress images online for free without uploading them to a server. Choose a quality level and download a smaller JPEG or WebP.',
    kw: 'compress image photo reduce size shrink optimize jpeg jpg png webp smaller',
    how: ['Drop an image or click to choose one.', 'Pick a quality level and output format.', 'Compare file sizes, then download the result.'],
    faq: [['Is my image uploaded anywhere?', 'No. The image is compressed by your browser using a canvas, and it is not sent to a server by this tool.'], ['Why is PNG not an option?', 'Browsers only apply quality settings to JPEG and WebP. Transparent areas in PNG files become white in JPEG output; WebP keeps transparency.']] },
  { id: 'image-resizer', name: 'Image Resizer', cat: 'Images', icon: 'resize', desc: 'Set exact dimensions or use social presets.',
    seo: 'Resize images to exact dimensions online. Use presets for Instagram, YouTube and more, lock the aspect ratio, and download as PNG, JPEG or WebP.',
    kw: 'resize image dimensions scale crop width height instagram youtube thumbnail profile picture hd',
    how: ['Upload an image.', 'Enter a width and height, or tap a preset.', 'Click Resize image, then download.'],
    faq: [['What does "Crop to fill" do?', 'It scales the image to cover the target size and trims the overflow, so nothing looks stretched.'], ['What is the largest size I can make?', 'Up to 8000 × 8000 pixels. Very large images may fail on phones with limited memory.']] },
  { id: 'qr-code-generator', name: 'QR Code Generator', cat: 'Generators', icon: 'qr', desc: 'Make QR codes for text, links and Wi-Fi.',
    seo: 'Generate QR codes for text, URLs and Wi-Fi networks. Pick colors, size and error correction, then download a PNG.',
    kw: 'qr code generator barcode link url wifi wi-fi text scan', isNew: 1,
    how: ['Choose Text, URL or Wi-Fi.', 'Enter your content. The code updates as you type.', 'Adjust size and colors, then download the PNG.'],
    faq: [['Which error correction level should I use?', 'Medium suits most cases. Higher levels survive more damage but make the code denser.'], ['Will it scan?', 'Keep strong contrast between the foreground and background colors, with the darker color in front.']] },
  { id: 'pdf-to-images', name: 'PDF to Images', cat: 'PDF', icon: 'pdf', desc: 'Turn PDF pages into PNG or JPG files.',
    seo: 'Convert PDF pages to PNG or JPG images in your browser. Select pages, preview them, and download each image.',
    kw: 'pdf to image convert pages png jpg jpeg extract document', isNew: 1,
    how: ['Upload a PDF.', 'Tick the pages you want.', 'Choose a format and quality, convert, then download the images.'],
    faq: [['Is the PDF uploaded?', 'No. The PDF is read and drawn by PDF.js inside your browser.'], ['Can I download everything at once?', 'Yes, "Download all" saves each image in turn. Your browser may ask permission to allow multiple downloads.']] },
  { id: 'word-counter', name: 'Word Counter', cat: 'Text', icon: 'text', desc: 'Count words, characters and reading time.',
    seo: 'Count words, characters, sentences and paragraphs as you type, and see an estimated reading time.',
    kw: 'word counter character count sentences paragraphs reading time text length',
    how: ['Type or paste your text.', 'Watch the counts update instantly.', 'Use Copy or Clear when you are done.'],
    faq: [['How is reading time estimated?', 'It assumes about 200 words per minute, which is a typical silent reading speed.'], ['Is my text saved?', 'No. It stays in the page and disappears when you close or reload it.']] },
  { id: 'percentage-calculator', name: 'Percentage Calculator', cat: 'Calculators', icon: 'percent', desc: 'Percent of, change, and discounts.',
    seo: 'Calculate percentages online: percent of a number, percentage change, increase, decrease and discounts, with the working shown.',
    kw: 'percentage percent calculator discount increase decrease change sale',
    how: ['Pick the kind of calculation.', 'Enter your two numbers.', 'Press Calculate to see the result and how it was worked out.'],
    faq: [['How is percentage change calculated?', '(new − old) ÷ old × 100. The old value must not be zero.'], ['How is a discount applied?', 'The discount amount is price × percent ÷ 100, and the final price is the price minus that amount.']] },
  { id: 'unit-converter', name: 'Unit Converter', cat: 'Converters', icon: 'unit', desc: 'Length, weight, temperature, data and more.',
    seo: 'Convert length, weight, temperature, area, volume, speed, time and data units instantly.',
    kw: 'unit converter length weight temperature area volume speed time data km miles kg pounds celsius fahrenheit mb gb',
    how: ['Choose a category.', 'Pick the From and To units.', 'Type a value. The result updates instantly.'],
    faq: [['Are gallons US or UK?', 'The converter uses US gallons, quarts, cups and fluid ounces.'], ['Is a KB 1000 or 1024 bytes?', 'KB, MB and GB are decimal (1000). KiB, MiB and GiB are binary (1024).']] },
  { id: 'age-calculator', name: 'Age Calculator', cat: 'Calculators', icon: 'cal', desc: 'Exact age and days to your next birthday.',
    seo: 'Work out your exact age in years, months and days, plus your next birthday. Your date of birth never leaves your browser.',
    kw: 'age calculator birthday date of birth years months days', isNew: 1,
    how: ['Pick your date of birth.', 'Press Calculate age.', 'See your age and your next birthday.'],
    faq: [['Is my date of birth stored?', 'No. It is calculated on your device and not saved or sent anywhere.'], ['What if I was born on 29 February?', 'In non-leap years the birthday is counted as 1 March.']] }
];
const tool = id => TOOLS.find(t => t.id === id);

/* SEO fields per tool: page title, H1, explanatory text, and a contextual internal link. */
const EXTRA = {
  'word-counter': { title: 'Free Word Counter Online – Count Words & Characters | TinyTools', h1: 'Free Online Word Counter',
    body: 'Paste or type your text and the word counter shows words, characters, sentences and paragraphs as you go. It is useful for essays, social posts, product descriptions and anything with a length limit, and it estimates reading time too.',
    cross: ['qr-code-generator', 'Need to turn a link into a scannable code?'] },
  'qr-code-generator': { title: 'Free QR Code Generator – Create QR Codes Online | TinyTools', h1: 'Free QR Code Generator',
    body: 'Create a QR code for a link, a piece of text or your Wi-Fi network, choose the colors and size, and download it as a PNG. The code is drawn in your browser, so there is nothing to sign up for.',
    cross: ['image-resizer', 'Preparing a poster or flyer image?'] },
  'image-compressor': { title: 'Image Compressor – Compress Images Online for Free | TinyTools', h1: 'Free Image Compressor',
    body: 'Smaller images load faster and are easier to email or upload. Pick a quality level, compare the before and after sizes, and download a lighter JPEG or WebP without sending the original to a server.',
    cross: ['image-resizer', 'Need exact dimensions as well?'] },
  'image-resizer': { title: 'Image Resizer – Resize Photos Online for Free | TinyTools', h1: 'Free Image Resizer',
    body: 'Set an exact width and height, keep the aspect ratio locked, or tap a preset for Instagram, YouTube and profile pictures. Crop to fill avoids stretched results when the shape changes.',
    cross: ['image-compressor', 'Want a smaller file size too?'] },
  'pdf-to-images': { title: 'PDF to Image Converter – Convert PDF to PNG or JPG | TinyTools', h1: 'PDF to Images Converter',
    body: 'Turn the pages of a PDF into PNG or JPG images. Preview every page, tick the ones you need, and download them one by one or all together. The PDF is opened in your browser and is not uploaded by this tool.',
    cross: ['image-compressor', 'Images too large after converting?'] },
  'percentage-calculator': { title: 'Percentage Calculator – Free Online % Calculator | TinyTools', h1: 'Free Percentage Calculator',
    body: 'Work out a percentage of a number, find what percent one number is of another, calculate an increase or decrease, or apply a discount. Each answer shows the formula so you can check it.',
    cross: ['unit-converter', 'Converting between units as well?'] },
  'unit-converter': { title: 'Unit Converter – Convert Length, Weight, Temperature & More | TinyTools', h1: 'Free Unit Converter',
    body: 'Convert length, weight, temperature, area, volume, speed, time and data units. The result updates as you type, and you can swap the units with one click.',
    cross: ['percentage-calculator', 'Need to work out a percentage?'] },
  'age-calculator': { title: 'Age Calculator – Find Your Exact Age in Years, Months & Days | TinyTools', h1: 'Free Age Calculator',
    body: 'Enter a date of birth to see an exact age in years, months and days, the date of the next birthday, and how many days are left until it. The date is calculated on your device and is not stored.',
    cross: ['unit-converter', 'Working with time units?'] }
};
TOOLS.forEach(t => Object.assign(t, EXTRA[t.id]));
const card = t => `<a class="card" href="/${t.id}"><span class="tico">${ico(t.icon)}</span><span class="go">${ico('arrow')}</span><h3>${t.name}${t.isNew ? '<span class="badge">New</span>' : ''}</h3><p>${t.desc}</p></a>`;
