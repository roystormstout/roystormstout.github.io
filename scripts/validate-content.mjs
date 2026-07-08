import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const dataPath = path.join(repoRoot, 'src', 'components', 'pinboard', 'data.ts');
const pinsDir = path.join(repoRoot, 'src', 'assets', 'pins');
const optimizedPinsDir = path.join(pinsDir, 'optimized');
const expectedBoardSides = new Set(['work', 'research', 'play']);
const expectedPinSizes = new Set(['sm', 'md', 'lg']);
const requiredStringFields = ['id', 'title', 'year', 'subtitle', 'description'];

const errors = [];

function report(message) {
  errors.push(message);
}

function formatNodeLocation(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${path.relative(repoRoot, sourceFile.fileName)}:${line + 1}:${character + 1}`;
}

function unwrapExpression(expression) {
  let current = expression;

  while (
    ts.isAsExpression(current)
    || ts.isSatisfiesExpression(current)
    || ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function getPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return null;
}

function getObjectProperties(objectExpression) {
  const properties = new Map();

  for (const property of objectExpression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;

    const name = getPropertyName(property.name);
    if (!name) continue;

    properties.set(name, property.initializer);
  }

  return properties;
}

function readStringLiteral(expression) {
  const value = unwrapExpression(expression);
  return ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value) ? value.text : null;
}

function readNumericLiteral(expression) {
  const value = unwrapExpression(expression);

  if (ts.isNumericLiteral(value)) {
    return Number(value.text);
  }

  if (
    ts.isPrefixUnaryExpression(value)
    && value.operator === ts.SyntaxKind.MinusToken
    && ts.isNumericLiteral(value.operand)
  ) {
    return -Number(value.operand.text);
  }

  return null;
}

function findBoardPinsInitializer(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'boardPins') continue;
      if (!declaration.initializer) return null;

      return unwrapExpression(declaration.initializer);
    }
  }

  return null;
}

function getWebpImports(sourceFile) {
  const imports = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

    const importName = statement.importClause?.name?.text;
    const importPath = statement.moduleSpecifier.text;

    if (importName && importPath.endsWith('.webp')) {
      imports.set(importName, importPath);
    }
  }

  return imports;
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFilesByExtension(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(extension))
    .map((entry) => entry.name)
    .sort();
}

function validatePin(sourceFile, side, pinExpression, webpImports, usedIds, usedImportNames) {
  if (!ts.isObjectLiteralExpression(pinExpression)) {
    report(`${formatNodeLocation(sourceFile, pinExpression)}: ${side} pin must be an object literal.`);
    return;
  }

  const context = formatNodeLocation(sourceFile, pinExpression);
  const properties = getObjectProperties(pinExpression);
  const id = readStringLiteral(properties.get('id'));

  for (const field of requiredStringFields) {
    const value = properties.get(field) ? readStringLiteral(properties.get(field)) : null;

    if (!value?.trim()) {
      report(`${context}: ${side}/${id || '<missing-id>'} has missing or empty ${field}.`);
    }
  }

  if (id) {
    if (usedIds.has(id)) {
      report(`${context}: duplicate pin id '${id}'.`);
    }

    usedIds.add(id);
  }

  const size = properties.get('size') ? readStringLiteral(properties.get('size')) : null;
  if (!size || !expectedPinSizes.has(size)) {
    report(`${context}: ${side}/${id || '<missing-id>'} must use size sm, md, or lg.`);
  }

  for (const field of ['initialRotate', 'hoverRotate']) {
    const value = properties.get(field) ? readNumericLiteral(properties.get(field)) : null;

    if (typeof value !== 'number' || Number.isNaN(value)) {
      report(`${context}: ${side}/${id || '<missing-id>'} has missing or invalid numeric ${field}.`);
    }
  }

  const imageExpression = properties.get('image') ? unwrapExpression(properties.get('image')) : null;
  if (!imageExpression || !ts.isIdentifier(imageExpression)) {
    report(`${context}: ${side}/${id || '<missing-id>'} image must reference an imported WebP asset.`);
  } else if (!webpImports.has(imageExpression.text)) {
    report(`${context}: ${side}/${id || '<missing-id>'} image import '${imageExpression.text}' is not a WebP import.`);
  } else {
    usedImportNames.add(imageExpression.text);
  }

  const anchorExpression = properties.get('anchor') ? unwrapExpression(properties.get('anchor')) : null;
  if (!anchorExpression || !ts.isObjectLiteralExpression(anchorExpression)) {
    report(`${context}: ${side}/${id || '<missing-id>'} anchor must be an object literal.`);
  }

  const bulletsExpression = properties.get('bullets') ? unwrapExpression(properties.get('bullets')) : null;
  if (!bulletsExpression || !ts.isArrayLiteralExpression(bulletsExpression) || bulletsExpression.elements.length === 0) {
    report(`${context}: ${side}/${id || '<missing-id>'} must include at least one bullet.`);
  } else {
    for (const bullet of bulletsExpression.elements) {
      const value = readStringLiteral(bullet);

      if (!value?.trim()) {
        report(`${formatNodeLocation(sourceFile, bullet)}: ${side}/${id || '<missing-id>'} has an empty or non-string bullet.`);
      }
    }
  }

  const link = properties.get('link') ? readStringLiteral(properties.get('link')) : null;
  const linkLabel = properties.get('linkLabel') ? readStringLiteral(properties.get('linkLabel')) : null;

  if (link || linkLabel) {
    if (!link || !linkLabel?.trim()) {
      report(`${context}: ${side}/${id || '<missing-id>'} link and linkLabel must be provided together.`);
    }

    if (link) {
      try {
        const url = new URL(link);

        if (!['http:', 'https:'].includes(url.protocol)) {
          report(`${context}: ${side}/${id || '<missing-id>'} link must use http or https.`);
        }
      } catch {
        report(`${context}: ${side}/${id || '<missing-id>'} has invalid URL '${link}'.`);
      }
    }
  }
}

function validateBoardPins(sourceFile, boardPinsExpression, webpImports) {
  if (!boardPinsExpression || !ts.isObjectLiteralExpression(boardPinsExpression)) {
    report(`${path.relative(repoRoot, dataPath)}: boardPins must be an object literal.`);
    return { usedImportNames: new Set() };
  }

  const usedIds = new Set();
  const usedImportNames = new Set();
  const boardProperties = getObjectProperties(boardPinsExpression);

  for (const side of expectedBoardSides) {
    if (!boardProperties.has(side)) {
      report(`${path.relative(repoRoot, dataPath)}: boardPins is missing '${side}'.`);
    }
  }

  for (const [side, pinsExpression] of boardProperties) {
    if (!expectedBoardSides.has(side)) {
      report(`${formatNodeLocation(sourceFile, pinsExpression)}: unexpected board side '${side}'.`);
      continue;
    }

    const pins = unwrapExpression(pinsExpression);
    if (!ts.isArrayLiteralExpression(pins) || pins.elements.length === 0) {
      report(`${formatNodeLocation(sourceFile, pinsExpression)}: board side '${side}' must contain at least one pin.`);
      continue;
    }

    for (const pin of pins.elements) {
      validatePin(sourceFile, side, unwrapExpression(pin), webpImports, usedIds, usedImportNames);
    }
  }

  for (const importName of webpImports.keys()) {
    if (!usedImportNames.has(importName)) {
      report(`${path.relative(repoRoot, dataPath)}: WebP import '${importName}' is not used by boardPins.`);
    }
  }

  return { usedImportNames };
}

async function validateAssetFiles(sourceFile, webpImports, usedImportNames) {
  const dataDir = path.dirname(sourceFile.fileName);
  const sourcePngFiles = await getFilesByExtension(pinsDir, '.png');
  const optimizedWebpFiles = await getFilesByExtension(optimizedPinsDir, '.webp');
  const sourceBasenames = new Set(sourcePngFiles.map((fileName) => path.basename(fileName, '.png')));
  const optimizedBasenames = new Set(optimizedWebpFiles.map((fileName) => path.basename(fileName, '.webp')));
  const usedOptimizedFiles = new Set();

  for (const importName of usedImportNames) {
    const importPath = webpImports.get(importName);
    const resolvedImportPath = path.resolve(dataDir, importPath);
    const fileName = path.basename(importPath);

    usedOptimizedFiles.add(fileName);

    if (!await pathExists(resolvedImportPath)) {
      report(`${path.relative(repoRoot, dataPath)}: image import '${importName}' points to missing file ${importPath}.`);
    }
  }

  for (const sourceBase of sourceBasenames) {
    if (!optimizedBasenames.has(sourceBase)) {
      report(`src/assets/pins/${sourceBase}.png is missing optimized/${sourceBase}.webp. Run npm run optimize:pins.`);
    }
  }

  for (const optimizedBase of optimizedBasenames) {
    if (!sourceBasenames.has(optimizedBase)) {
      report(`src/assets/pins/optimized/${optimizedBase}.webp has no matching source ${optimizedBase}.png.`);
    }
  }

  for (const optimizedFile of optimizedWebpFiles) {
    if (!usedOptimizedFiles.has(optimizedFile)) {
      report(`src/assets/pins/optimized/${optimizedFile} is not referenced by boardPins.`);
    }
  }
}

const dataSource = await readFile(dataPath, 'utf8');
const sourceFile = ts.createSourceFile(dataPath, dataSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const webpImports = getWebpImports(sourceFile);
const boardPinsExpression = findBoardPinsInitializer(sourceFile);
const { usedImportNames } = validateBoardPins(sourceFile, boardPinsExpression, webpImports);

await validateAssetFiles(sourceFile, webpImports, usedImportNames);

if (errors.length > 0) {
  console.error('Content validation failed:');

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(`Content validation passed for ${usedImportNames.size} pin assets.`);