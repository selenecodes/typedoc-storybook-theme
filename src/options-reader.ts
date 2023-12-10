import { Options, OptionsReader } from 'typedoc';

export class MarkdownThemeOptionsReader implements OptionsReader {
  name = 'storybook-theme-reader';
  readonly order = 900;
  readonly supportsPackages = false;
  read(container: Options) {
    if (container.getValue('theme') === 'default') {
      container.setValue('theme', 'storybook');
    }
  }
}