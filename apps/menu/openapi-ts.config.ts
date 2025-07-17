import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://127.0.0.1:8000/openapi.json',
  output: './client',
  plugins: [
    '@hey-api/sdk',
    {
      name: '@hey-api/sdk',
      client: "@hey-api/client-axios"

    }
  ]
});