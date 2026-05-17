/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: {
        ignoreDiagnostics: [5011, 5107, 5108],
        warnOnly: true,
      },
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
        resolveJsonModule: true,
        isolatedModules: true,
        rootDir: '../../',
      }
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/tests/**/*.test.ts'],
  roots: ['<rootDir>/dashboard/lib'],
};
