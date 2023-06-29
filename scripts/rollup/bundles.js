'use strict';

const bundleTypes = {
  UMD_DEV: 'UMD_DEV',
  UMD_PROD: 'UMD_PROD',
};

const {UMD_DEV, UMD_PROD} = bundleTypes;

const moduleTypes = {
  // React
  ISOMORPHIC: 'ISOMORPHIC',
  // Individual renderers. They bundle the reconciler. (e.g. ReactDOM)
  RENDERER: 'RENDERER',
  // Helper packages that access specific renderer's internals. (e.g. TestUtils)
  RENDERER_UTILS: 'RENDERER_UTILS',
  // Standalone reconciler for third-party renderers.
  RECONCILER: 'RECONCILER',
};

const {ISOMORPHIC, RENDERER} = moduleTypes;

const bundles = [
  /******* Isomorphic *******/
  {
    bundleTypes: [UMD_DEV, UMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react',
    global: 'React',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['ReactNativeInternalFeatureFlags'],
  },

  /******* React DOM *******/
  {
    bundleTypes: [UMD_DEV, UMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom',
    global: 'ReactDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },
];

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles);
deepFreeze(bundleTypes);
deepFreeze(moduleTypes);

function getOriginalFilename(bundle, bundleType) {
  let name = bundle.name || bundle.entry;
  // we do this to replace / to -, for react-dom/server
  name = name.replace('/index.', '.').replace('/', '-');
  switch (bundleType) {
    case UMD_DEV:
      return `${name}.development.js`;
    case UMD_PROD:
      return `${name}.production.min.js`;
  }
}

function getFilename(bundle, bundleType) {
  const originalFilename = getOriginalFilename(bundle, bundleType);
  // Ensure .server.js or .client.js is the final suffix.
  // This is important for the Server tooling convention.
  if (originalFilename.indexOf('.server.') !== -1) {
    return originalFilename
      .replace('.server.', '.')
      .replace('.js', '.server.js');
  }
  if (originalFilename.indexOf('.client.') !== -1) {
    return originalFilename
      .replace('.client.', '.')
      .replace('.js', '.client.js');
  }
  return originalFilename;
}

module.exports = {
  bundleTypes,
  moduleTypes,
  bundles,
  getFilename,
};
