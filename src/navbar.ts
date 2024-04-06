import { h } from "./vhtml.js";

export const navbar = h("div", { class: "noprint" }, [
  h("div", { class: "navbar no-link-underlines" }, [
    h("div", { class: "navbar-item" }, [h("a", { href: "/" }, ["Jim Fisher"])]),
    h("div", { class: "navbar-item" }, [
      h("a", { href: "/cv", class: "cv-link" }, ["CV"]),
    ]),
    h("div", { class: "navbar-item" }, [
      h("a", { href: "/speaking" }, ["Speaking"]),
    ]),
    h("div", { class: "navbar-item" }, [
      h("a", { href: "/blogroll" }, ["Blogroll"]),
    ]),
    h("div", { class: "navbar-item" }, [
      h("a", { href: "https://jameshfisher.com/feed.xml" }, ["RSS"]),
    ]),
    h("div", { class: "navbar-item" }, [
      h("a", { href: "https://tigyog.app", target: "_blank" }, [
        h("img", {
          src: "/assets/tigyog/icon-192.png",
          style: "width: 1em; position: relative; top: 0.1em;",
        }),
        " TigYog",
      ]),
    ]),
    h("div", { class: "navbar-item" }, [
      h("a", { href: "https://kickabout.club", target: "_blank" }, [
        h("img", {
          src: "/assets/kickabout/icon-192.png",
          style: "width: 1em; position: relative; top: 0.1em;",
        }),
        " Kickabout",
      ]),
    ]),
  ]),
]);
