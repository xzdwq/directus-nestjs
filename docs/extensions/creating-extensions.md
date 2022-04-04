# Creating Extensions

## Scaffolding your Directus Extension

The easiest way to start developing extensions is to use the `create-directus-extension` utility:

```bash
npm init directus-extension
```

After specifying the the name of the extension, the type of the extension and the programming language you want to use,
the utility will create a folder with the recommended file structure to create an extension.

### Extension Folder Structure

The folder created by the utility is in fact a npm package. It comes with a few pre-installed packages depending on the
extension type and the language you chose. The most important one is `@directus/extensions-sdk`. This package includes a
CLI, which allows you to build your extension and to scaffold additional extensions, and it provides Typescript helpers
and other utilities.

Inside the created folder there is a `src/` folder. This folder contains the entrypoint of your extension. If you write
additional source files, they should go into this folder.

::: tip Entrypoint

The entrypoint is either called `index.js` or `index.ts`, depending on which programming language you chose.

:::

The generated `package.json` file contains an additional `directus:extension` field with the following sub-fields:

- `type` — The type of the extension
- `path` — The path to the built extension
- `source` — The path to the source entrypoint
- `host` — A semver string that indicates with which versions of the Directus host, the extension is compatible with

The CLI will use those fields by default to determine the input and output file paths and how the extension should be
built.

## Building your Extension

Before your extension can be used by Directus, it has to be built. If you used the `create-directus-extension` utility
to scaffold your extension, building your extension is as easy as running:

```bash
npm run build
```

The generated `package.json` contains a script that calls the `directus-extension` CLI which is part of
`@directus/extensions-sdk`:

```json
{
	"scripts": {
		"build": "directus-extension build"
	}
}
```

If you prefer to scaffold your extension manually, you can use the `directus-extension` CLI binary directly. The
`--help` flag provides useful information regarding the available options and flags.

Internally, the CLI uses Rollup to bundle your extension to a single entrypoint.

::: tip Watch

The CLI supports rebuilding extensions whenever a file has changed by using the `--watch` flag.

:::

### Configuring the CLI

Most of the time, it should be sufficient to use the CLI as is. But, in some cases it might be necessary to customize it
to your specific needs. This can be done by creating a `extension.config.js` file at the root of your extension package
with the following content:

```js
module.exports = {
	plugins: [],
};
```

#### Supported Options

- `plugins` — An array of Rollup plugins that will be used when building extensions in addition to the built-in ones.

::: tip CommonJS or ESM

By using the `type` field inside your `package.json` file or using the appropriate file extension (`.mjs` or `.cjs`),
the config file can be loaded as a CommonJS or ESM file.

:::

## Deploying your Extension

To deploy your extension, you have to move the output from the `dist/` folder into your project's
`./extensions/<extension-folder>/<extension-name>/` folder. `<extension-folder>` has to be replaced by the extension
type in plural form (e.g. interfaces). `<extension-name>` should be replaced with the name of your extension.

::: warning Configurable Folders

The path to the built extension as well as the extensions directory are configurable and may be located elsewhere.

:::

## Developing your Extension

To learn more about developing extensions of a specific type, you can refer to one of the individual guides:

#### App Extensions

- [Interfaces](/extensions/interfaces/)
- [Displays](/extensions/displays/)
- [Layouts](/extensions/layouts/)
- [Modules](/extensions/modules/)
- [Panels](/extensions/panels/)

#### API Extensions

- [Hooks](/extensions/hooks/)
- [Endpoints](/extensions/endpoints/)

::: tip Live Reloading

When working on extensions, try setting the
[`EXTENSIONS_AUTO_RELOAD` environment variable](/configuration/config-options). This will make the API reload extensions
on changes automatically.

:::
