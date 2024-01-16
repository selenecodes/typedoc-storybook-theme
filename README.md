# typedoc-storybook-theme

TypeDoc theme to create technical documentation integrated within Storybook.
Credits go to [https://github.com/felixabele/typedoc-storybook-theme](@felixabele) for creating the first version of this plugin,
it seemed unmaintained and I needed a new version hence the new plugin.

## Description

This theme will generate `*.stories.mdx` files from your documentation and add the `<Meta title='api reference/filename' />`
tag to every file. In contrast to the original plugin it also generates a `modules` folder containing the typescript modules.

## Usage

```
  typedoc --plugin typedoc-storybook-theme-v2 --storybookPath \"typedoc/my-doc\"
```

Option `storybookPath` defines the path under which the doc will be displayed in Storybook.

Ensure that the docs are loaded by Storybook by adjusting the `main.js` stories property.

## Dependencies

Currently only typedoc > 0.25.0 is supported.
