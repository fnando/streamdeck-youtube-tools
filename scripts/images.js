const { dir } = require("console");
const fs = require("fs");
const path = require("path");
const sourceDir = path.resolve(
  path.join(__dirname, "../assets/images/actions"),
);

const imagePaths = fs
  .readdirSync(sourceDir)
  .filter((p) => p.endsWith("@2x.png"));

const images = {};

imagePaths.forEach((fileName) => {
  const outputName = path
    .basename(fileName)
    .split("@")
    .shift()
    .replace(/_(.)/, (_match, char) => char.toUpperCase());

  const binary = fs.readFileSync(path.join(sourceDir, fileName));
  const base64 = binary.toString("base64");
  const dataURL = `data:image/png;base64,${base64}`;

  images[outputName] = dataURL;
});

fs.writeFileSync(
  path.resolve(path.join(__dirname, "../src/images.json")),
  JSON.stringify(images, null, 2),
);
