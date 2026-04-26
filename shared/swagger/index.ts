import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// ─── Service Route Maps ───────────────────────────────────────────────────────
/**
 * "services-based" Swagger strategy:
 * Each service vertical is mapped to one or more doc audiences.
 * A path is included in a doc if it starts with ANY of the prefixes listed.
 */

/** Route prefixes visible to app-users (customers) */
const USER_ROUTE_PREFIXES = [
  '/auth',
  '/users',
  '/common',
  // marketplace verticals (customer-facing)
  // '/grocery',
  // '/hardware-shop',
  // '/food-delivery',
  // '/education',
  // '/grocery-service',
  // '/local-deals',
  '/ondemand',
  '/pick-n-drop',
  // '/transport-service',
  // '/bookings',
  '/resources',
  '/setting',
  '/chat',
  '/util',
];

/** Route prefixes visible to service providers / drivers (every service has a provider side) */
const PROVIDER_ROUTE_PREFIXES = [
  '/auth',
  '/users',
  '/common',
  // all service verticals — each one has provider-facing endpoints
  // '/dairy-drop',
  // '/grocery',
  // '/hardware-shop',
  // '/food-delivery',
  // '/education',
  // '/grocery-service',
  // '/local-deals',
  '/ondemand',
  '/pick-n-drop',
  // '/transport-service',
  // '/bookings',
  '/resources',
  '/setting',
  '/chat',
  '/util',
];

// ─── Entry Point ─────────────────────────────────────────────────────────────

export default async function initSwagger(app: INestApplication): Promise<void> {
  const configService = app.get(ConfigService);
  const apiUrl = configService.get<string>('API_URL');
  const port = configService.get<number>('PORT', 3000);
  const serverUrl = apiUrl || `http://localhost:${port}`;

  // Build a single master document from all controllers
  const masterConfig = new DocumentBuilder()
    .setTitle('HelpingHob API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header', name: 'Authorization' },
      'bearer',
    )
    .addServer(serverUrl, 'Current Server')
    .build();

  const masterDocument = SwaggerModule.createDocument(app, masterConfig, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });

  // Inject global headers into every operation for professional documentation
  if (masterDocument.paths) {
    for (const path of Object.values(masterDocument.paths)) {
      for (const operation of Object.values(path)) {
        if (typeof operation === 'object' && operation !== null) {
          operation.parameters = operation.parameters || [];
          operation.parameters.push(
            {
              name: 'x-platform',
              in: 'header',
              required: true,
              description: 'Client platform (android/ios/web)',
              schema: { type: 'string', enum: ['android', 'ios', 'web'], default: 'ios' },
            },
            {
              name: 'x-app-version',
              in: 'header',
              required: true,
              description: 'Current app version',
              schema: { type: 'string', default: '1.0.0' },
            },
            {
              name: 'x-lang',
              in: 'header',
              required: false,
              description: 'Language code (en/ar)',
              schema: { type: 'string', default: 'en' },
            },
          );
        }
      }
    }
  }

  // ── User Doc (/docs/user) ──────────────────────────────────────────────────
  const userDoc = cloneDocWithPaths(
    masterDocument,
    filterPathsByAudience(masterDocument, USER_ROUTE_PREFIXES, 'user'),
    {
      title: '🧑‍💼 User (Customer) API',
      description: '',
    },
  );
  SwaggerModule.setup('docs/user', app, userDoc, swaggerUiOptions({
    title: 'User API – HelpingHob',
    accentColor: '#4ade80',
  }));

  // ── Provider Doc (/docs/provider) ─────────────────────────────────────────
  const providerDoc = cloneDocWithPaths(
    masterDocument,
    filterPathsByAudience(masterDocument, PROVIDER_ROUTE_PREFIXES, 'provider'),
    {
      title: '🔧 Provider / Driver API',
      description: ''
    },
  );
  SwaggerModule.setup('docs/provider', app, providerDoc, swaggerUiOptions({
    title: 'Provider API – HelpingHob',
    accentColor: '#f97316',
  }));

  // ── Index Page (/docs) ────────────────────────────────────────────────────
  const express = app.getHttpAdapter().getInstance();
  express.get('/docs', (_req: any, res: any) => {
    res.send(buildIndexHtml());
  });

  // ── JSON endpoints for programmatic access ────────────────────────────────
  express.get('/docs/user/json', (_req: any, res: any) => res.json(userDoc));
  express.get('/docs/provider/json', (_req: any, res: any) => res.json(providerDoc));

  console.log('📖 Swagger docs:');
  console.log('   /docs          → Index');
  console.log('   /docs/user     → Customer API');
  console.log('   /docs/provider → Provider & Driver API');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Filter OpenAPI paths to only those starting with allowed prefixes AND
 * matching the doc audience (using x-doc-type extension if present).
 */
function filterPathsByAudience(
  document: any,
  prefixes: string[],
  audience: 'user' | 'provider'
): Record<string, any> {
  const result: Record<string, any> = {};

  // Mapping of x-doc-type values to audiences
  const audienceMap: Record<string, string[]> = {
    user: ['user', 'customer', 'both'],
    provider: ['provider', 'driver', 'vendor', 'both', 'merchant'],
  };

  const allowedTypes = audienceMap[audience] || [audience];

  for (const [path, item] of Object.entries<any>(document.paths ?? {})) {
    const isPrefixAllowed = prefixes.some(p => path.startsWith(p));
    if (!isPrefixAllowed) continue;

    const filteredMethods: Record<string, any> = {};
    let hasMatchingMethods = false;

    for (const [method, operation] of Object.entries<any>(item)) {
      if (typeof operation !== 'object' || operation === null) continue;

      const docTypeAttr = operation['x-doc-type'];
      if (docTypeAttr) {
        const docTypes = docTypeAttr.split(',');
        const isTargetAudience = docTypes.some(type => allowedTypes.includes(type.trim()));

        if (isTargetAudience) {
          filteredMethods[method] = operation;
          hasMatchingMethods = true;
        }
      } else {
        // Fallback: if no x-doc-type is specified, include by default via prefix
        filteredMethods[method] = operation;
        hasMatchingMethods = true;
      }
    }

    if (hasMatchingMethods) {
      result[path] = filteredMethods;
    }
  }
  return result;
}

/**
 * Deep-clone the master document and replace its paths + metadata.
 */
function cloneDocWithPaths(
  master: any,
  paths: Record<string, any>,
  info: { title: string; description: string },
): any {
  return {
    ...master,
    info: {
      ...master.info,
      title: info.title,
      description: info.description,
    },
    paths,
    // Carry over components (schemas, securitySchemes) from master
    components: master.components,
  };
}

/**
 * Shared Swagger UI options factory.
 */
function swaggerUiOptions(opts: { title: string; accentColor: string }) {
  return {
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: opts.title,
    customfavIcon: '/fav32.ico',
    customCss: `
      .swagger-ui .topbar { background: ${opts.accentColor}; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info h1 { color: ${opts.accentColor}; }
      .swagger-ui .opblock-tag { cursor: pointer; }
      .swagger-ui .opblock.opblock-post   .opblock-summary-method { background: #3b82f6; }
      .swagger-ui .opblock.opblock-get    .opblock-summary-method { background: #22c55e; }
      .swagger-ui .opblock.opblock-put    .opblock-summary-method { background: #f59e0b; }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
      .swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: #a855f7; }
    `,
  };
}

/** Styled /docs index page */
function buildIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HelpingHob API Docs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, Arial, sans-serif; background: #0f172a;
           color: #e2e8f0; margin: 0; min-height: 100vh;
           display: flex; align-items: center; justify-content: center; padding: 24px; }
    .wrapper { max-width: 640px; width: 100%; }
    h1 { font-size: 2rem; margin: 0 0 4px; color: #f1f5f9; }
    .sub { font-size: .95rem; color: #64748b; margin: 0 0 40px; }
    .grid { display: grid; gap: 16px; }
    .card { background: #1e293b; border-radius: 14px; padding: 20px 24px;
            display: flex; align-items: center; gap: 18px;
            text-decoration: none; color: inherit; border: 1px solid #334155;
            transition: border-color .2s, transform .2s; }
    .card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .icon { font-size: 2rem; line-height: 1; flex-shrink: 0; }
    .info h2 { margin: 0 0 4px; font-size: 1.05rem; color: var(--accent); }
    .info p  { margin: 0; font-size: .83rem; color: #94a3b8; line-height: 1.5; }
    .badge { display: inline-block; font-size: .7rem; background: rgba(255,255,255,.08);
             border-radius: 99px; padding: 2px 8px; margin-left: 6px; vertical-align: middle; }
    .divider { border: none; border-top: 1px solid #1e293b; margin: 8px 0; }
  </style>
</head>
<body>
<div class="wrapper">
  <h1>📡 HelpingHob API</h1>
  <p class="sub">User/Provider Separate API docs — choose your role below</p>
  <div class="grid">
    <a class="card" href="/docs/user" style="--accent:#4ade80">
      <span class="icon">🧑‍💼</span>
      <div class="info">
        <h2>User (Customer) API <span class="badge">User Api</span></h2>
        <p>Auth · Profile · Grocery · Hardware Shop · Food Delivery · Education · Grocery Service · Local Deals · On-Demand · Pick &amp; Drop · Transport · Bookings · Resources · Settings · Chat</p>
      </div>
    </a>
    <a class="card" href="/docs/provider" style="--accent:#f97316">
      <span class="icon">🔧</span>
      <div class="info">
        <h2>Provider API <span class="badge">Partner Api</span></h2>
        <p>Auth · Profile · Dairy Drop (shop mgmt) · On-Demand · Pick &amp; Drop Driver · Transport Driver · Bookings · Resources · Settings · Chat</p>
      </div>
    </a>
   
  </div>
</div>
</body>
</html>`;
}
