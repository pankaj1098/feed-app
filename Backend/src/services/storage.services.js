const { ImageKit } = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// ImageKit stores larger images but refuses to deliver them (ELIMIT).
const MAX_IMAGE_PIXELS = 25 * 1000 * 1000;

async function uploadFile(buffer) {
  const result = await imagekit.files.upload({
    file: buffer.toString("base64"),
    fileName: "image.jpg",
  });

  if (result.width && result.height && result.width * result.height > MAX_IMAGE_PIXELS) {
    await imagekit.files.delete(result.fileId).catch(() => {});
    const error = new Error(
      "Image resolution is too high (max 25 megapixels). Please choose a smaller image.",
    );
    error.statusCode = 400;
    throw error;
  }

  return result;
}

module.exports = uploadFile;
