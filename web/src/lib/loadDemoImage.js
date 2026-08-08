/** Load a demo ImageBitmap once for the scroll story. */
export async function loadDemoImage(url = '/sample.jpg') {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob);
}
