import {
  PageEvent,
  Reflection,
  DeclarationReflection,
  UrlMapping,
  ProjectReflection,
  Renderer,
  RenderTemplate,
} from "typedoc";
import { MarkdownTheme } from "typedoc-plugin-markdown";
import { toId } from "@componentdriven/csf";

export class StorybookTheme extends MarkdownTheme {
  storybookPath: string;

  constructor(renderer: Renderer) {
    super(renderer);
    this.storybookPath = this.getOption("storybookPath") as string;
  }

  /**
   * override toUrl to export .stories.mdx instead of .md
   * @note This applies only to non-root files, README.md and modules.md won't be affected
   * the getUrls method below takes care of renaming those.
   */
  override toUrl(mapping: any, reflection: DeclarationReflection) {
    return mapping.directory + '/' + this.getUrl(reflection) + '.stories.mdx'
  }

  /**
   * rename root-level files like README to storybook-stories
   */
  override getUrls(project: ProjectReflection): UrlMapping<any>[] {
    const origUrls = super.getUrls(project);

    // Rename root-level files like README to storybook-stories whilst leaving modules untouched
    origUrls.filter((urlMapping) => urlMapping.model.kind == 1).forEach((urlMapping) => {
      urlMapping.url = urlMapping.url.replace(".md", ".stories.mdx");
    })

    return origUrls
  }

  /**
   * Create a storybook path for a given story
   * 
   * @example
   * prependStorybookPath("readme")
   * => "TypeDoc/readme"
   * 
   * @example
   * prependStorybookPath("readme", "-")
   * => "TypeDoc-readme"
   * 
   * @param name - name of the story
   * @param delimiter - delimiter to use for the story name, use "/" for storybook Meta tags
   * and "-" for storybook links
   * @returns Storybook path
   */
  prependStorybookPath(name: string, delimiter: "/" | "-" = "/") {
    return [this.storybookPath, name].join(delimiter);
  }

  /**
   * 1. normal link replacement
   * TypeDoc/kindString/newLink.stories.mdx
   * => ?path=/story/typedoc-kindstring-newlink--page
   * 2. hashed link replacement
   * TypeDoc/kindString/newLink.stories.mdx#hash
   * => #hash
   */
  storybookLink(link: string): string {
    const newLink = link.replace(/\(|\)/g, "").replace(".stories.mdx", "");
    const [fileName, hash] = newLink.split("#");
    const file = fileName.replace(/\W/g, "-").toLowerCase();
    const path = this.prependStorybookPath(file, "-"); // E.g. Typedoc-readme
    return hash ? `(#${hash})` : `(?path=/docs/${toId(path, 'docs')})`;
  }

  storybookLinksReplacement(content: string): string {
    const links =
      content.match(/\(([A-Za-z0-9_:/.\-\s]+).stories.mdx.*?\)/gm) || [];
    let newContent = content;
    links.forEach((link) => {
      newContent = newContent.replace(link, this.storybookLink(link));
    });

    const modulesLink = this.storybookLink("modules");
    newContent = newContent.replace("(modules.md)", modulesLink);
    const readmeLink = this.storybookLink("readme");
    newContent = newContent.replace("(README.md)", readmeLink);
    return newContent;
  }

  override render(page: PageEvent<Reflection>, template: RenderTemplate<PageEvent<Reflection>>): string {
    let renderedPage: string = super.render(page, template);
    const path = this.prependStorybookPath(page.url.replace(".stories.mdx", ""));
    renderedPage = `import { Meta } from "@storybook/blocks";\n\n<Meta title='${path}' />\n\n${renderedPage}`;
    renderedPage = this.storybookLinksReplacement(renderedPage);
    return renderedPage;
  }

  /**
   * force absolute paths
   */
  override getRelativeUrl(absolute: string) {
    return absolute;
  }
}
