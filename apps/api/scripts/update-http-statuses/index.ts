/**
 * Adapted from https://github.com/prettymuchbryce/http-status-codes/blob/c840bc674ab043551b87194d1ebb5415f222abbe/scripts/update-codes.ts
 * Generates legacy format only.
 */

import {
  EnumMemberStructure,
  OptionalKind,
  Project,
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
 * Script to generate TypeScript enums for HTTP status codes and phrases.
 *
 * @remarks
 * - Uses `ts-morph` to programmatically create and overwrite source files.
 * - Outputs two enums: `StatusCodes` and `StatusPhrases`, each with JSDoc comments.
 * - Deprecated codes are annotated with `@deprecated`.
 * - Only generates legacy format (enum-based).
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

  // Generate enum members for StatusCodes
  const statusCodeMembers: OptionalKind<EnumMemberStructure>[] = Codes.map(
    ({ code, constant, comment, isDeprecated }: JsonCode) => {
      const { doc, description } = comment;
      const deprecatedString = isDeprecated ? '@deprecated\n' : '';
      return {
        name: constant,
        value: code,
        docs: [`${deprecatedString}${doc}\n\n${description}`],
      };
    },
  ).sort(({ value: aValue }, { value: bValue }) => aValue - bValue);

  // Create StatusCodes enum file
  const statusCodeFile = project.createSourceFile(
    'src/lib/http/status-codes.ts',
    {
      statements: [
        {
          kind: StructureKind.Enum,
          name: 'StatusCodes',
          isExported: true,
          members: statusCodeMembers,
        },
      ],
    },
    {
      overwrite: true,
    },
  );

  // Create StatusPhrases enum file
  const reasonPhraseMembers: OptionalKind<EnumMemberStructure>[] = Codes.map(
    ({ phrase, constant, comment, isDeprecated }: JsonCode) => {
      const { doc, description } = comment;
      const deprecatedString = isDeprecated ? '@deprecated\n' : '';
      return {
        name: constant,
        value: phrase,
        docs: [`${deprecatedString}${doc}\n\n${description}`],
      };
    },
  );

  const reasonPhraseFile = project.createSourceFile(
    'src/lib/http/status-phrases.ts',
    {
      statements: [
        {
          kind: StructureKind.Enum,
          name: 'StatusPhrases',
          isExported: true,
          members: reasonPhraseMembers,
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
    'Successfully generated src/http-status-codes.ts and src/http-status-phrases.ts',
  );
};

run();
