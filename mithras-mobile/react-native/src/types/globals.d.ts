// Minimal global type shims for React Native + Hermes.
// Some dependencies ship TypeScript sources that assume Node-style globals.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Buffer: any;

// Ensure URL has the fields used by imported helpers.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface URL {
  pathname: string;
}
