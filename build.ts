import { clean, build } from "./src/build";
clean();
await build({ dev: false });
