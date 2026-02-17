/**
 * 2026 Best Practice: Dynamic Meta Tag Injection
 * Automatically updates SEO and OpenGraph tags based on state.
 */
export const updateMetadata = (args: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}) => {
  if (typeof document === 'undefined') return;

  const { title, description, image, url } = args;
  const siteTitle = 'NEXUS – Global AI Shop 2026';
  const finalTitle = `${title} | ${siteTitle}`;

  // 1. Basic Meta
  document.title = finalTitle;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', description);

  // 2. OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', finalTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  if (image) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', image);
  }

  if (url) {
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url);
  }
};
