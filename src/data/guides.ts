export interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  summary: string;
  summaryBn: string;
  readTime: string;
  category: string;
  content: string[];
  contentBn: string[];
  relatedToolSlug: string;
}

export const PRACTICAL_GUIDES: GuideArticle[] = [
  {
    id: 'convert-png-to-jpg-guide',
    slug: 'how-to-convert-png-to-jpg',
    title: 'How to Convert PNG to JPG Without Quality Loss',
    titleBn: 'কোয়ালিটি না হারিয়ে পিএনজি থেকে জেপিজি কনভার্ট করার নিয়ম',
    summary: 'Understand when to convert PNGs to JPEG, how to select compression quality, and how transparent pixels are handled.',
    summaryBn: 'কখন পিএনজি কনভার্ট করতে হবে এবং ট্রান্সপারেন্ট ছবির ব্যাকগ্রাউন্ড কীভাবে সেট করতে হয় জানুন।',
    readTime: '3 min read',
    category: 'Image Tools',
    relatedToolSlug: 'png-to-jpg',
    content: [
      'PNG (Portable Network Graphics) is a lossless format ideal for screenshots, UI icons, and logos with sharp edges or transparency. However, high-resolution PNGs can be several megabytes in size.',
      'JPEG uses lossy discrete cosine transform compression, making it drastically lighter for photography and complex digital art. Converting a 5MB PNG to JPEG at 90% quality often yields a 450KB file with no noticeable degradation.',
      'Transparency Handling: Because JPEG does not support an alpha transparency channel, any transparent pixels must be rendered against a solid color. NovaTools lets you pick a crisp white, black, or custom background color to prevent black borders.',
      'Best practice: For web uploads, set the quality slider between 85% and 92% for the optimal balance of sharp details and low file weight.',
    ],
    contentBn: [
      'পিএনজি একটি লসলেস ফরম্যাট যা আইকন, স্ক্রিনশট ও ট্রান্সপারেন্ট ছবির জন্য ভালো। তবে এর সাইজ অনেক বেশি হয়।',
      'জেপিজি ছবিকে অনেক হালকা করে। ৯০% কোয়ালিটিতে সেভ করলে সাইজ প্রায় ৮০% কমে যায় কিন্তু ছবির মান চমৎকার থাকে।',
      'ট্রান্সপারেন্সি সতর্কতা: জেপিজিতে স্বচ্ছ ব্যাকগ্রাউন্ড থাকে না, তাই যেকোনো ব্যাকগ্রাউন্ড কালার সিলেক্ট করে নেওয়া জরুরি।',
    ],
  },
  {
    id: 'compress-image-for-web-guide',
    slug: 'how-to-compress-images-for-web',
    title: 'How to Compress an Image for a Website',
    titleBn: 'ওয়েবসাইটের জন্য ছবির সাইজ অপ্টিমাইজ করার পদ্ধতি',
    summary: 'Learn how to dramatically speed up your website load times and improve Core Web Vitals by optimizing images.',
    summaryBn: 'ওয়েবসাইটের স্পিড ও কোর ওয়েব ভাইটালস বাড়াতে ছবির সাইজ কমানোর উপায়।',
    readTime: '4 min read',
    category: 'Image Tools',
    relatedToolSlug: 'image-compressor',
    content: [
      'Images typically account for over 60% of total web page weight. Uncompressed photos cause slow loading, poor Google Core Web Vitals (LCP), and high mobile bounce rates.',
      'Step 1: Resize to the maximum display dimension. If a banner displays at 1200px width on desktop, don’t upload an unresized 6000px camera photo.',
      'Step 2: Compress using browser-level Canvas resampling at 80% to 85% quality. This discards high-frequency pixel variations invisible to the human eye while slashing bytes.',
      'Step 3: Compare before and after sizes. In NovaTools Image Compressor, you can see live byte reduction before saving.',
    ],
    contentBn: [
      'ওয়েবসাইটের মোট সাইজের ৬০% এর বেশি থাকে ছবি। সঠিক কম্প্রেশন সাইটের লোডিং গতি কয়েকগুণ বাড়িয়ে দেয়।',
      'প্রথমে ডিসপ্লে মাপ অনুযায়ী রিসাইজ করুন এবং ৮০%-৮৫% কোয়ালিটিতে কম্প্রেস করুন।',
    ],
  },
  {
    id: 'combine-multiple-pdfs-guide',
    slug: 'how-to-merge-pdf-files',
    title: 'How to Combine Multiple PDF Files Into One',
    titleBn: 'একাধিক পিডিএফ ফাইল কীভাবে একটি ফাইলে একত্র করবেন',
    summary: 'A complete step-by-step walkthrough for ordering and merging multiple PDF documents privately in your browser.',
    summaryBn: 'সম্পূর্ণ নিরাপদে এবং ব্রাউজারেই একাধিক পিডিএফ মার্জ করার গাইড।',
    readTime: '3 min read',
    category: 'PDF Tools',
    relatedToolSlug: 'merge-pdf',
    content: [
      'Whether submitting tax documents, job application portfolios, or academic research, merging separate PDF pages into a single file ensures seamless review.',
      'Client-Side Privacy: Most commercial online tools upload your confidential PDF contracts to external cloud servers. NovaTools uses pure client-side WebAssembly and pdf-lib, meaning your documents never leave your computer.',
      'Ordering: Ensure your documents are arranged in chronological or logical order before clicking Merge. NovaTools allows quick drag-and-drop or up/down sorting of each file.',
      'Result: The engine generates a clean unified PDF with accurate cross-reference tables and full font retention.',
    ],
    contentBn: [
      'সিভি, সার্টিফিকেট বা অফিসিয়াল ডকুমেন্ট একত্রে পাঠানোর জন্য পিডিএফ মার্জ করা প্রয়োজন।',
      'নোভাটুলসে ফাইল কোনো রিমোট সার্ভারে যায় না, সরাসরি ব্রাউজারে সুরক্ষিতভাবে প্রসেস হয়।',
    ],
  },
  {
    id: 'image-to-pdf-guide',
    slug: 'how-to-turn-images-into-pdf',
    title: 'How to Turn Multiple Images into One PDF',
    titleBn: 'ছবি দিয়ে কীভাবে পরিষ্কার পিডিএফ তৈরি করবেন',
    summary: 'Convert scans, receipts, notes, and photos into a standardized, paginated A4 or Letter PDF.',
    summaryBn: 'রিসিপ্ট, নোট ও ফটো থেকে স্ট্যান্ডার্ড সাইজের পিডিএফ তৈরির নিয়ম।',
    readTime: '3 min read',
    category: 'PDF Tools',
    relatedToolSlug: 'image-to-pdf',
    content: [
      'Turning phone photos of physical receipts or lecture notes into an organized PDF makes sharing and printing effortless.',
      'Page Sizing: Choose standard A4 for international paperwork or US Letter for North American standards. Alternatively, use Fit-to-Image if you want each page to match the exact dimensions of your original photo.',
      'Margins: Adding a 20pt margin prevents content from being clipped during physical printer paper feeding.',
      'NovaTools Image to PDF converter supports batch multi-image selection and creates valid PDF standards instantly.',
    ],
    contentBn: [
      'কাগজের ডকুমেন্ট বা রসিদের ছবিকে পিডিএফে পরিণত করলে সহজে শেয়ার ও প্রিন্ট করা যায়।',
      'A4 বা Letter পেজ সাইজ বেছে নিয়ে মার্জিন ঠিক করে এক ক্লিকে পিডিএফ ডাউনলোড করুন।',
    ],
  },
  {
    id: 'qr-code-guide',
    slug: 'how-to-generate-qr-codes',
    title: 'How to Generate and Customize Scannable QR Codes',
    titleBn: 'স্ক্যানযোগ্য কিউআর কোড তৈরি ও ব্যবহারের নিয়ম',
    summary: 'Best practices for QR code sizing, error correction levels, Wi-Fi sharing, and high-contrast color choices.',
    summaryBn: 'কিউআর কোডের সাইজ, কালার কনট্রাস্ট ও এরর কারেকশন লেভেল নির্ধারণের সেরা উপায়।',
    readTime: '4 min read',
    category: 'Developer & SEO',
    relatedToolSlug: 'qr-code-generator',
    content: [
      'QR (Quick Response) codes are 2D matrix symbologies capable of encoding up to thousands of alphanumeric characters.',
      'Contrast Rule: Always maintain high contrast between the foreground modules and background. Dark code on a light background is standard; inverted colors (light code on dark) can fail on older phone cameras.',
      'Error Correction (ECC): Levels range from L (7% recovery) to H (30% recovery). If you plan to print your QR code on a business card or vehicle where it might experience wear or scratches, choose Level M or Q.',
      'Wi-Fi QR Codes: Encode `WIFI:S:MyNetwork;T:WPA;P:Password;;` so guests can join your network instantly without typing passwords manually.',
    ],
    contentBn: [
      'কিউআর কোডে সব সময় ব্যাকগ্রাউন্ড ও কোডের মধ্যে ভালো কনট্রাস্ট রাখা জরুরি যাতে যেকোনো ফোন সহজে স্ক্যান করতে পারে।',
      'ওয়াইফাই কিউআর কোডের মাধ্যমে পাসওয়ার্ড টাইপ না করেই নেটওয়ার্কে কানেক্ট করা সম্ভব।',
    ],
  },
  {
    id: 'format-json-safely-guide',
    slug: 'how-to-format-json-safely',
    title: 'How to Format and Debug JSON Safely',
    titleBn: 'নিরাপদে জেএসওন ফরম্যাট ও সিনট্যাক্স ভুল শনাক্তকরণ',
    summary: 'Common JSON formatting mistakes (trailing commas, single quotes) and why client-side formatting protects sensitive API payloads.',
    summaryBn: 'জেএসওনের সাধারণ ভুলগুলো এবং কেন ব্রাউজারে ফরম্যাট করা সবচেয়ে নিরাপদ।',
    readTime: '3 min read',
    category: 'Text & Document Tools',
    relatedToolSlug: 'json-formatter',
    content: [
      'JSON (JavaScript Object Notation) is the ubiquitous standard for web APIs, config files, and databases.',
      'Common Syntax Errors: 1. Trailing commas (e.g. `{"id": 1,}` is invalid JSON). 2. Single quotes (keys and strings must use double quotes `"`). 3. Unquoted object keys.',
      'Security: Pasting JSON containing authentication tokens, user emails, or internal database records into third-party web formatters risks data interception. NovaTools JSON Formatter parses entirely within local JavaScript memory with zero network calls.',
    ],
    contentBn: [
      'জেএসওন ফরম্যাটে ট্রেইলিং কমা বা সিঙ্গেল কোট ব্যবহার করা যায় না, ডাবল কোট আবশ্যক।',
      'নোভাটুলসের জেএসওন ফরম্যাটারে আপনার ডেটা সম্পূর্ণ নিরাপদ থাকে কারণ এটি ব্রাউজারের বাইরে যায় না।',
    ],
  },
];
