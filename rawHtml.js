import h from "vhtml";

// https://github.com/developit/vhtml/issues/11#issuecomment-561463401
export const rawHtml = (html) =>
  h(null, {
    dangerouslySetInnerHTML: { __html: html },
  });
