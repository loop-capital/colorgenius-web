// Ambient declarations for side-effect style imports (e.g. app/layout.tsx -> ./globals.css).
// Next.js handles CSS at build time; TypeScript needs the module declared.
declare module "*.css";
