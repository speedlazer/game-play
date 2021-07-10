/* eslint-env node */
require("@babel/register");
const validate = require("jsonschema").validate;
const { resolve } = require("path");
const { readdir } = require("fs").promises;
const fs = require("fs");

const assignUnit = (amount, unitLevel = 0) =>
  amount > 1024
    ? assignUnit(amount / 1024, unitLevel + 1)
    : { amount, unitLevel };

const toHuman = amount => {
  const withUnit = assignUnit(amount);
  const scale = ["b", "Kb", "Mb", "Gb"];

  return `${Math.round(withUnit.amount * 100) / 100} ${
    scale[withUnit.unitLevel]
  }`;
};

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
}

const getRelativePath = (entry, dataRoot) => {
  const relativePath = entry
    .slice(dataRoot.length + 1)
    .split("/")
    .slice(0, -1)
    .join(".");
  return relativePath;
};

const injectFolderPath = (folder, contents) => {
  if (!contents) return;
  Object.values(contents).forEach(item => (item.diskFolder = folder));
};

const blockKeys = ["habitats", "habitat"];

const scrubDevelopmentObject = object =>
  Object.entries(object).reduce(
    (acc, [key, value]) =>
      blockKeys.includes(key) ? acc : { ...acc, [key]: value },
    {}
  );

const scrubDevelopmentData = (contents, skip = false) =>
  skip
    ? contents
    : Object.entries(contents).reduce(
        (acc, [key, object]) =>
          key.startsWith("test.")
            ? acc
            : { ...acc, [key]: scrubDevelopmentObject(object) },
        {}
      );

// Based on:
// https://v8.dev/blog/cost-of-javascript-2019#json

module.exports = async function(input) {
  this.cacheable(true);

  const folders = JSON.parse(input);
  const path = this.resourcePath.split("/").slice(0, -1);

  const schemas = {};
  const validateJSON = (filePath, fileContent, type) => {
    const schema = schemas[type];
    if (!schema) return;
    const relativePath = path.slice(0, -2).join("/");
    const result = validate(fileContent, schema);
    result.errors.forEach(e =>
      this.emitWarning(
        new Error(`${filePath.slice(relativePath.length + 1)}: ${e.stack}`)
      )
    );
  };
  const dataRoot = resolve(path.join("/"));

  this.addContextDependency(path.join("/"));
  const entries = await getFiles(path.join("/"));
  const developmentMode = process.env.NODE_ENV === "development";

  const allData = folders.reduce((acc, { name: entypoint, type, schema }) => {
    if (schema) {
      const schemaPath = path
        .slice(0, -2)
        .concat(schema)
        .join("/");
      this.addDependency(schemaPath);

      const schemaContents = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
      schemas[type] = schemaContents;
    }

    const struct = entries.reduce((acc, entry) => {
      if (entry.endsWith(`${type}.js`)) {
        delete require.cache[require.resolve(entry)];
        const file = require(entry);
        const fileContent = file.default;
        validateJSON(entry, fileContent, type);
        if (developmentMode) {
          const relativePath = getRelativePath(entry, dataRoot);
          injectFolderPath(relativePath, fileContent);
        }
        return {
          ...acc,
          ...scrubDevelopmentData(fileContent, developmentMode)
        };
      }
      if (entry.endsWith(`${type}.json`)) {
        const file = fs.readFileSync(entry, "utf8");
        const fileContent = JSON.parse(file);
        validateJSON(entry, fileContent, type);
        if (developmentMode) {
          const relativePath = getRelativePath(entry, dataRoot);
          injectFolderPath(relativePath, fileContent);
        }
        return {
          ...acc,
          ...scrubDevelopmentData(fileContent, developmentMode)
        };
      }

      return acc;
    }, {});
    return { ...acc, [entypoint]: struct };
  }, {});
  const stringData = JSON.stringify(allData);

  console.log(`Bundling ${toHuman(stringData.length)} of game data`);
  const content = `
export const data = JSON.parse("${stringData.replace(/"/g, '\\"')}");
`;
  const exports = folders.map(
    ({ name: folder }) =>
      `
export const ${folder}Data = data.${folder};
export const ${folder} = name => ${folder}Data[name];
`
  );

  return [content].concat(exports).join("\n\n");
};
