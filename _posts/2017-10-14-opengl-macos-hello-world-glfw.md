---
title: "macOS OpenGL hello world using GLFW"
---

<img alt="cyan window" src="{% link assets/2017-10-14/window.png %}" style="width: 432px; height: 374px;"/>

What a beautiful cyan!
I made this window on macOS using C, OpenGL and [GLFW](http://www.glfw.org/).
Here's the C:

```c
// main.c
#include <GLFW/glfw3.h>
int main(void) {
  if (!glfwInit()) return -1;
  GLFWwindow* window = glfwCreateWindow(320, 240, "Hello World", NULL, NULL);
  if (!window) {
    glfwTerminate();
    return -1;
  }
  glfwMakeContextCurrent(window);
  glClearColor(0.0f, 1.0f, 1.0f, 1.0f);
  while (!glfwWindowShouldClose(window)) {
    glClear(GL_COLOR_BUFFER_BIT);
    glfwSwapBuffers(window);
    glfwPollEvents();
  }
  glfwTerminate();
  return 0;
}
```

To compile it:

```
$ brew install glfw3
$ clang -lglfw -framework OpenGL main.c
$ ./a.out
```

GLFW is an abstraction over the different window systems of MacOS, Linux, Windows, etc.
This C should also work on Windows or Linux,
though the compilation steps may look different.
