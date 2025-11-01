/**
 * Converts a remote image URL into a File object.
 * Useful when sending updates with FormData where the image didn't change.
 *
 * @param {string} url - The URL of the image (e.g., from Django MEDIA_URL)
 * @param {string} [filename] - Optional filename for the file
 * @returns {Promise<File>} A File object that can be appended to FormData
 */
export async function urlToFile(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();

  // Try to infer filename from URL if not provided
  const name = filename || url.split('/').pop() || 'image.jpg';
  const type = blob.type || 'image/jpeg';

  return new File([blob], name, { type });
}
