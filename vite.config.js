/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const isLocalHostname = (hostname) => (
  hostname === 'localhost' ||
  hostname.endsWith('.localhost') ||
  hostname === '0.0.0.0' ||
  hostname === '[::]' ||
  hostname === '[::1]' ||
  /^127(?:\.\d{1,3}){3}$/.test(hostname)
)

const validatePublicOrigin = (name, rawValue) => {
  const value = rawValue?.trim()

  if (!value) {
    throw new Error(`${name} is required for production builds.`)
  }

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`)
  }

  if (url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS for production builds.`)
  }

  if (isLocalHostname(url.hostname.toLowerCase())) {
    throw new Error(`${name} must not point to a local host in production.`)
  }

  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an origin only (for example, https://api.example.com).`)
  }

  return url.origin
}

const validateOptionalPublicEndpoint = (name, rawValue) => {
  const value = rawValue?.trim()
  if (!value) return null

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid absolute URL when configured.`)
  }

  if (url.protocol !== 'https:' || isLocalHostname(url.hostname.toLowerCase())) {
    throw new Error(`${name} must use a non-local HTTPS URL in production.`)
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not include URL credentials.`)
  }

  return url.origin
}

export const validateBuildEnvironment = (env) => ({
  apiOrigin: validatePublicOrigin('VITE_API_BASE', env.VITE_API_BASE),
  socketOrigin: validatePublicOrigin('VITE_SOCKET_URL', env.VITE_SOCKET_URL),
  errorOrigin: validateOptionalPublicEndpoint('VITE_ERROR_ENDPOINT', env.VITE_ERROR_ENDPOINT),
})

const createContentSecurityPolicy = ({ apiOrigin, socketOrigin, errorOrigin }) => {
  const socketWebSocketOrigin = `wss://${new URL(socketOrigin).host}`
  const connectSources = [
    ...new Set(["'self'", apiOrigin, socketOrigin, socketWebSocketOrigin, errorOrigin]),
  ].filter(Boolean)

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSources.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

const productionCspPlugin = (origins) => ({
  name: 'algogambit-production-csp',
  apply: 'build',
  transformIndexHtml: {
    order: 'pre',
    handler: () => ([
      {
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: createContentSecurityPolicy(origins),
        },
        injectTo: 'head-prepend',
      },
    ]),
  },
})

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const productionOrigins = command === 'build' ? validateBuildEnvironment(env) : null

  return {
    plugins: [
      react(),
      ...(productionOrigins ? [productionCspPlugin(productionOrigins)] : []),
    ],

    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },

    build: {
      // Don't expose source maps in production — keeps internals private
      sourcemap: false,

      // Warn when a chunk exceeds 500 kB
      chunkSizeWarningLimit: 500,

      // No manualChunks: every route and every WebGL backdrop is behind a
      // dynamic import, so the bundler derives the split from the real import
      // graph. Hand-written vendor buckets used to mis-file React's CJS build
      // into the recharts chunk, which made the landing page download all of
      // recharts before it could render.
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  }
})
