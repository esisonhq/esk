/**
 * Adapted from https://github.com/prettymuchbryce/http-status-codes/blob/c840bc674ab043551b87194d1ebb5415f222abbe/scripts/update-codes.ts
 * Generates const objects with `as const` assertion instead of enums.
 */

import {
  OptionalKind,
  Project,
  PropertySignatureStructure,
  StructureKind,
} from 'ts-morph';

interface JsonCodeComment {
  doc: string;
  description: string;
}

interface JsonCode {
  code: number;
  phrase: string;
  constant: string;
  comment: JsonCodeComment;
  isDeprecated?: boolean;
}

/**
 * Script to generate TypeScript const objects for HTTP status codes and phrases.
 *
 * @remarks
 * - Uses `ts-morph` to programmatically create and overwrite source files.
 * - Outputs two const objects: `StatusCodes` and `StatusPhrases`, each with JSDoc comments.
 * - Deprecated codes are annotated with `@deprecated`.
 * - Uses `as const` assertion for better type inference.
 *
 * @example
 * Run the script from the root of the project:
 * ```bash
 * tsx scripts/generate-status-enums.ts
 * ```
 */
const run = async () => {
  console.log(
    'Updating src/lib/http/status-codes.ts and src/lib/http/status-phrases.ts',
  );

  const codeSourceUrl =
    'https://raw.githubusercontent.com/prettymuchbryce/http-status-codes/refs/heads/master/codes.json';

  // Initialize ts-morph project using existing tsconfig
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  // Fetch the latest HTTP status codes from the source JSON
  const response = await fetch(codeSourceUrl);
  if (!response.ok) {
    throw new Error(`Error retrieving codes: ${response.statusText}`);
  }
  const Codes = (await response.json()) as JsonCode[];

  // Helper function to format JSDoc comments
  const formatComment = (comment: string): string => {
    return comment.replace(/\n/g, '\n   * ');
  };

  // Generate properties for StatusCodes
  const statusCodeProperties: OptionalKind<PropertySignatureStructure>[] =
    Codes.map(({ code, constant, comment, isDeprecated }: JsonCode) => {
      const { doc, description } = comment;
      const deprecatedString = isDeprecated ? '@deprecated\n' : '';
      const fullComment = `${deprecatedString}${doc}\n\n${description}`;
      return {
        name: constant,
        type: code.toString(),
        docs: [fullComment],
      };
    }).sort(
      ({ type: aType }, { type: bType }) => Number(aType) - Number(bType),
    );

  // Create StatusCodes const object file
  const statusCodeFile = project.createSourceFile(
    'src/lib/http/status-codes.ts',
    {
      statements: [
        {
          kind: StructureKind.VariableStatement,
          isExported: true,
          declarations: [
            {
              name: 'StatusCodes',
              initializer: `{
${statusCodeProperties
  .map((prop) => {
    const comment = typeof prop.docs?.[0] === 'string' ? prop.docs[0] : '';
    return `  /** ${formatComment(comment)} */\n  ${prop.name}: ${prop.type}`;
  })
  .join(',\n')},
} as const`,
            },
          ],
        },
      ],
    },
    {
      overwrite: true,
    },
  );

  // Create StatusPhrases const object file
  const reasonPhraseProperties: OptionalKind<PropertySignatureStructure>[] =
    Codes.map(({ phrase, constant, comment, isDeprecated }: JsonCode) => {
      const { doc, description } = comment;
      const deprecatedString = isDeprecated ? '@deprecated\n' : '';
      const fullComment = `${deprecatedString}${doc}\n\n${description}`;
      return {
        name: constant,
        type: `"${phrase}"`,
        docs: [fullComment],
      };
    });

  const reasonPhraseFile = project.createSourceFile(
    'src/lib/http/status-phrases.ts',
    {
      statements: [
        {
          kind: StructureKind.VariableStatement,
          isExported: true,
          declarations: [
            {
              name: 'StatusPhrases',
              initializer: `{
${reasonPhraseProperties
  .map((prop) => {
    const comment = typeof prop.docs?.[0] === 'string' ? prop.docs[0] : '';
    return `  /** ${formatComment(comment)} */\n  ${prop.name}: ${prop.type}`;
  })
  .join(',\n')},
} as const`,
            },
          ],
        },
      ],
    },
    {
      overwrite: true,
    },
  );

  // Insert header comments into both files
  [statusCodeFile, reasonPhraseFile].forEach((sf) => {
    sf.insertStatements(0, '// Generated file. Do not edit\n');
    sf.insertStatements(
      1,
      `// Codes retrieved on ${new Date().toUTCString()} from ${codeSourceUrl}`,
    );
  });

  // Save all changes to disk
  await project.save();

  console.log(
    'Successfully generated src/lib/http/status-codes.ts and src/lib/http/status-phrases.ts',
  );
};

run();
