import { readdir, readFile } from 'node:fs/promises';
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
const expectedOptimizedWidths = new Set(['320', '480', '640']);
const expectedOptimizedFormats = new Set(['avif', 'webp']);
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

async function getFilesByExtension(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(extension))
    .map((entry) => entry.name)
    .sort();
}

function readPinImageBaseName(expression) {
  const value = unwrapExpression(expression);

  if (!ts.isCallExpression(value)) return null;
  if (!ts.isIdentifier(value.expression) || value.expression.text !== 'getPinImage') return null;
  if (value.arguments.length !== 1) return null;

  return readStringLiteral(value.arguments[0]);
}

function validatePin(sourceFile, side, pinExpression, usedIds, usedImageBasenames) {
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

  const imageBaseName = properties.get('image') ? readPinImageBaseName(properties.get('image')) : null;
  if (!imageBaseName?.trim()) {
    report(`${context}: ${side}/${id || '<missing-id>'} image must call getPinImage('<source-png-basename>').`);
  } else {
    usedImageBasenames.add(imageBaseName);
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

function validateBoardPins(sourceFile, boardPinsExpression) {
  if (!boardPinsExpression || !ts.isObjectLiteralExpression(boardPinsExpression)) {
    report(`${path.relative(repoRoot, dataPath)}: boardPins must be an object literal.`);
    return { usedImageBasenames: new Set() };
  }

  const usedIds = new Set();
  const usedImageBasenames = new Set();
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
      validatePin(sourceFile, side, unwrapExpression(pin), usedIds, usedImageBasenames);
    }
  }

  return { usedImageBasenames };
}

async function validateAssetFiles(usedImageBasenames) {
  const sourcePngFiles = await getFilesByExtension(pinsDir, '.png');
  const optimizedWebpFiles = await getFilesByExtension(optimizedPinsDir, '.webp');
  const optimizedAvifFiles = await getFilesByExtension(optimizedPinsDir, '.avif');
  const sourceBasenames = new Set(sourcePngFiles.map((fileName) => path.basename(fileName, '.png')));
  const optimizedFiles = [...optimizedWebpFiles, ...optimizedAvifFiles];

  for (const imageBaseName of usedImageBasenames) {
    if (!sourceBasenames.has(imageBaseName)) {
      report(`${path.relative(repoRoot, dataPath)}: getPinImage('${imageBaseName}') has no matching src/assets/pins/${imageBaseName}.png.`);
    }
  }

  for (const sourceBase of sourceBasenames) {
    if (!usedImageBasenames.has(sourceBase)) {
      report(`src/assets/pins/${sourceBase}.png is not referenced by boardPins.`);
    }

    for (const width of expectedOptimizedWidths) {
      for (const format of expectedOptimizedFormats) {
        const optimizedFile = `${sourceBase}-${width}.${format}`;

        if (!optimizedFiles.includes(optimizedFile)) {
          report(`src/assets/pins/${sourceBase}.png is missing optimized/${optimizedFile}. Run npm run optimize:pins.`);
        }
      }
    }
  }

  for (const optimizedFile of optimizedFiles) {
    const match = optimizedFile.match(/^(.+)-(\d+)\.(avif|webp)$/);

    if (!match) {
      report(`src/assets/pins/optimized/${optimizedFile} does not match <source-basename>-<width>.<avif|webp>.`);
      continue;
    }

    const [, sourceBase, width, format] = match;

    if (!sourceBasenames.has(sourceBase)) {
      report(`src/assets/pins/optimized/${optimizedFile} has no matching source ${sourceBase}.png.`);
    }

    if (!usedImageBasenames.has(sourceBase)) {
      report(`src/assets/pins/optimized/${optimizedFile} is not referenced by boardPins.`);
    }

    if (!expectedOptimizedWidths.has(width)) {
      report(`src/assets/pins/optimized/${optimizedFile} uses unexpected width ${width}.`);
    }

    if (!expectedOptimizedFormats.has(format)) {
      report(`src/assets/pins/optimized/${optimizedFile} uses unexpected format ${format}.`);
    }
  }
}

const dataSource = await readFile(dataPath, 'utf8');
const sourceFile = ts.createSourceFile(dataPath, dataSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const boardPinsExpression = findBoardPinsInitializer(sourceFile);
const { usedImageBasenames } = validateBoardPins(sourceFile, boardPinsExpression);

await validateAssetFiles(usedImageBasenames);

if (errors.length > 0) {
  console.error('Content validation failed:');

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(`Content validation passed for ${usedImageBasenames.size} pin assets.`);