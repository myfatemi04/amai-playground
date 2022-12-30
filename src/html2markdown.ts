import { Readability } from "@mozilla/readability";
import { api } from "./api";

type Content =
  | {
      type: "image";
      src: string;
      alt: string;
      title: string;
    }
  | {
      type: "link";
      href: string;
      children: Content[];
    }
  | {
      type: "text";
      text: string;
    }
  | {
      type: "container";
      children: Content[];
    }
  | {
      type: "heading";
      level: number;
      children: Content[];
    }
  | {
      type: "code";
      lang: string;
      text: string;
      multiline: boolean;
    }
  | {
      type: "paragraph";
      children: Content[];
    };

function nodeToJson(node: Node, withinPre = false) {
  const content: Content[] = [];
  // @ts-ignore
  for (const child of node.childNodes) {
    if (child.nodeType === 1) {
      switch (child.tagName) {
        case "IMG":
          content.push({
            type: "image",
            src: child.getAttribute("src"),
            alt: child.getAttribute("alt"),
            title: child.getAttribute("title"),
          });
          break;
        case "A": {
          const children = nodeToJson(child);
          if (children.length === 0) {
            break;
          }
          content.push({
            type: "link",
            href: child.getAttribute("href"),
            children,
          });
          break;
        }
        case "BR":
          content.push({ type: "text", text: "\n" });
          break;
        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6": {
          const childContent = nodeToJson(child);
          content.push({
            type: "heading",
            level: parseInt(child.tagName[1]),
            children: childContent,
          });
          break;
        }
        case "CODE": {
          if (!withinPre) {
            content.push({
              type: "code",
              lang: child.getAttribute("lang"),
              text: child.textContent,
              multiline: false,
            });
            break;
          } else {
            content.push({
              type: "code",
              lang: child.getAttribute("lang"),
              text: child.textContent,
              multiline: true,
            });
            break;
          }
        }
        case "PRE": {
          const childContent = nodeToJson(child, true);
          // @ts-ignore
          const text = childContent.map((c) => c.text).join("\n");
          if (text) {
            content.push({
              type: "code",
              lang: child.getAttribute("lang"),
              multiline: true,
              text,
            });
          }
          break;
        }
        case "P": {
          const childContent = nodeToJson(child);
          content.push({
            type: "paragraph",
            children: childContent,
          });
          break;
        }
        default: {
          const childContent = nodeToJson(child);
          if (childContent.length === 1) {
            content.push(childContent[0]);
          } else if (childContent.length > 1) {
            content.push({
              type: "container",
              children: childContent,
            });
          }
          break;
        }
      }
    } else if (child.nodeType === 3) {
      const text = child.textContent.replace(/\s+/g, " ");
      if (text) {
        content.push({ type: "text", text });
      }
    }
  }
  return content;
}

function escapeForMarkdown(text: string) {
  return text.replace("<", "&lt;").replace("#", "&#35;");
}

export function jsonToMarkdown(
  json: any,
  options: { ignoreLinks: boolean; ignoreImages: boolean }
) {
  const content: string[] = [];
  for (const child of json) {
    switch (child.type) {
      case "text":
        content.push(escapeForMarkdown(child.text));
        break;
      case "image":
        if (options.ignoreImages) {
          if (child.alt) {
            content.push(`\n(Image: ${child.alt})\n`);
          } else {
            content.push("\n(Image)\n");
          }
        } else {
          content.push(`\n![${child.alt || ""}](${child.src})\n`);
        }
        break;
      case "link":
        if (options) {
          content.push(jsonToMarkdown(child.children, options));
        } else {
          content.push(
            `[${escapeForMarkdown(jsonToMarkdown(child.children, options))}](${
              child.href
            })`
          );
        }
        break;
      case "container":
        content.push(jsonToMarkdown(child.children, options));
        break;
      case "heading":
        content.push(
          `\n${"#".repeat(child.level)} ${jsonToMarkdown(
            child.children,
            options
          )}\n`
        );
        break;
      case "code":
        if (child.multiline) {
          content.push(`\n\`\`\`${child.lang ?? ""}\n${child.text}\n\`\`\`\n`);
        } else {
          content.push(`\`${child.text}\``);
        }
        break;
      case "paragraph":
        content.push(`\n${jsonToMarkdown(child.children, options)}\n`);
        break;
      default: {
        console.error("Unknown type", child.type, child);
        break;
      }
    }
  }
  return content.join("");
}

export function htmlToJson(html: string) {
  return nodeToJson(htmlToDocument(html).body);
}

export function htmlToMarkdown(
  html: string,
  options: { ignoreLinks: boolean; ignoreImages: boolean }
) {
  return jsonToMarkdown(htmlToJson(html), options);
}

function htmlToDocument(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

export function getMainArticle(html: string) {
  const readability = new Readability(htmlToDocument(html));
  const result = readability.parse();
  return result ? { content: result.content, title: result.title } : null;
}

// async function main() {
//   const url =
//     "https://www.ducksters.com/science/physics/resistors_in_series_and_parallel.php";
//   const jsdom = await JSDOM.fromURL(url);
//   const readability = new Readability(jsdom.window.document, { debug: false });
//   const result = readability.parse();
//   const json = htmlToJson(result.content);
//   const markdown = jsonToMarkdown(json);
// }
