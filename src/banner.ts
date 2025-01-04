import { h } from "./vhtml.js";

export const banner = h(
  "a",
  {
    style:
      "display: block; clear: both; margin: 0 0 1em 0; text-decoration-color: white;",
    href: "https://en.wikipedia.org/wiki/Gaza_genocide",
    target: "_blank",
  },
  [
    h(
      "div",
      {
        style:
          "background-color: black; color: white; padding: 0.5em; font-weight: bold;",
      },
      [
        "Learn more about Israeli genocide in Gaza, funded by the USA, Germany, the UK and others.",
      ],
    ),
  ],
);
