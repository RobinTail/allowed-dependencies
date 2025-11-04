# Changelog

## Version 2

### v2.0.1

- Fixed wrong filename in the `types` of `package.json`.

### v2.0.0

- Supported Node.js versions: `^20.19.0 || ^22.12.0 || ^24.0.0`;
- ESM only build: all the Node.js versions listed above support `require(ESM)`;

## Version 1

### v1.3.2

- `ramda` version is `^0.32.0`.

### v1.3.1

- `ramda` version is `^0.31.3`.

### v1.3.0

- Supporting Node 24.

### v1.2.0

- Feat: ability to handle multiple `package.json` or workspaces:
  - You can now supply several sets of options to the plugin config.

### v1.1.1

- Fix for the `development` option:
  - Default value changed to `typeOnly` (no breaking changes);
  - The `false` now prohibits the corresponding category of dependencies.

### v1.1.0

- New config option `development` (disabled by default) for handling `devDependencies`.

### v1.0.1

- Upgraded all dependencies;
- There is now an opportunity to support the project with sponsorship: https://github.com/sponsors/RobinTail

### v1.0.0

- Stable, no changes since v0.5.2.

## Version 0

### v0.5.2

- Upgraded all dependencies;
- Minor adjustments to the tests.

### v0.5.1

- Minor refactoring;
- Additional tests.

### v0.5.0

- Added type declarations;
- Fixed `module` field in package.

### v0.4.1

- Improving documentation.

### v0.4.0

- Breaking changes:
  - The `manifest` option replaced with `packageDir` (string, optional);
    - The default value is the ESLint `process.cwd()`;
    - The plugin can now read the `package.json` itself;
    - The plugin can now operate without options.

### v0.3.1

- Integration test and this changelog added;
- Separated the rule from the plugin entrypoint.

### v0.3.0

- Configurable option `ignore`.

### v0.2.5

- Improved documentation.

### v0.2.4

- Code optimization;
- Documentation improvement;
- Node version constraints.

### v0.2.3

- Fixed documentation.

### v0.2.2

- Added keywords.

### v0.2.1

- Basic documentation.

### v0.2.0

- Changed builder to `tsup`;
- Code splitting.

### v0.1.0

- Configurable options: `production`, `requiredPeers`, `optionalPeers`.

### v0.0.3

- Added package metadata and license.

### v0.0.2

- Changed the peer to `typescript-eslint`.

### v0.0.1

- Initial concept.
