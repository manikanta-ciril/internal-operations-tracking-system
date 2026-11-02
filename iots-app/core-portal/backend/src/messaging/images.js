const sharp = require("sharp");
const { fail } = require("./policy");
const types = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};
async function imageMediaType(name, bytes) {
  if (!/\.(png|jpe?g|webp|gif)$/i.test(name)) return null;
  try {
    const metadata = await sharp(bytes, {
      limitInputPixels: 40000000,
    }).metadata();
    if (!types[metadata.format] || metadata.width * metadata.height > 40000000)
      throw fail(400, "Choose an image under 40 megapixels.");
    return types[metadata.format];
  } catch (error) {
    if (error.status === 400) throw error;
    throw fail(
      400,
      "This image cannot be read. Choose a PNG, JPEG, GIF or WebP image.",
    );
  }
}
module.exports = { imageMediaType };
