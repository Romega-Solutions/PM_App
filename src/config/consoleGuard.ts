declare const __DEV__: boolean | undefined;

const isDevelopment =
  typeof __DEV__ === "boolean" ? __DEV__ : process.env.NODE_ENV !== "production";

if (!isDevelopment) {
  console.log = () => undefined;
  console.debug = () => undefined;
  console.info = () => undefined;
}
