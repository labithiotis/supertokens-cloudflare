import { defineConfig } from "tsup";

export default defineConfig({
    tsconfig: "./tsconfig.json",
    entry: ["./lib/ts/**/*.ts"],
    bundle: false,
    clean: true,
    dts: false,
    format: ["cjs", "esm"],
    outDir: "./lib/build",
    sourcemap: false,
    splitting: false,
    minify: false,
    outExtension({ format }) {
        return {
            js: format === "esm" ? `.mjs` : `.${format}`,
        };
    },
});
