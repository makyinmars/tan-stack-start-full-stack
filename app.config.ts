import { defineConfig } from '@tanstack/react-start/config';
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    // https://tanstack.com/router/v1/docs/framework/react/start/hosting
    preset: "aws-lambda",
    awsLambda: {
      streaming: true,
    },
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
    ],
  },
});
