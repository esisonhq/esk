/**
 * Automatically detects the current deployment region from various cloud platforms.
 * Sets DATABASE_REGION environment variable for optimal database replica selection.
 *
 * The region value is used directly from the platform - no mapping needed.
 * Users configure DATABASE_REGIONS to match their platform's region names.
 */

/**
 * Platform-specific region detection - returns raw platform region values.
 */
const platformDetectors = {
  /**
   * Fly.io region detection - returns raw Fly region codes
   */
  flyio: (): string | null => {
    const flyRegion = process.env.FLY_REGION;
    const flyPrimary = process.env.FLY_PRIMARY_REGION;

    // Return the actual Fly.io region code (e.g., "ams", "dfw", "lhr")
    return flyRegion || flyPrimary || null;
  },

  /**
   * Render region detection - returns raw Render region names
   */
  render: (): string | null => {
    const renderRegion = process.env.RENDER_SERVICE_REGION;

    // Return the actual Render region name (e.g., "oregon", "virginia")
    return renderRegion || null;
  },

  /**
   * Railway region detection - returns raw Railway region names
   */
  railway: (): string | null => {
    const railwayRegion = process.env.RAILWAY_REGION;

    // Return the manually set Railway region
    return railwayRegion || null;
  },

  /**
   * Vercel region detection - returns raw Vercel region codes
   */
  vercel: (): string | null => {
    const vercelRegion = process.env.VERCEL_REGION;

    // Return the actual Vercel region code (e.g., "iad1", "dfw1", "lhr1")
    return vercelRegion || null;
  },

  /**
   * AWS region detection - returns raw AWS region names
   */
  aws: (): string | null => {
    const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

    // Return the actual AWS region name (e.g., "us-east-1", "eu-west-1")
    return awsRegion || null;
  },
};

/**
 * Detects the current deployment region from various cloud platforms.
 *
 * @returns The raw platform region string, or null if none detected
 */
export const detectDeploymentRegion = (): string | null => {
  // Check if already manually set
  if (process.env.DATABASE_REGION) {
    console.log(
      `Using manually set DATABASE_REGION: ${process.env.DATABASE_REGION}`,
    );
    return process.env.DATABASE_REGION;
  }

  // Try each platform detector in order of preference
  const detectors = [
    { name: 'Fly.io', detect: platformDetectors.flyio },
    { name: 'Render', detect: platformDetectors.render },
    { name: 'Vercel', detect: platformDetectors.vercel },
    { name: 'Railway', detect: platformDetectors.railway },
    { name: 'AWS', detect: platformDetectors.aws },
  ];

  for (const { name, detect } of detectors) {
    const region = detect();
    if (region) {
      console.log(`Detected region '${region}' from ${name}`);
      return region;
    }
  }

  // No platform detected
  console.warn('Could not detect deployment region from any platform');
  return null;
};

/**
 * Automatically sets the DATABASE_REGION environment variable if detected.
 * Call this early in your application startup, before database initialization.
 */
export const setDatabaseRegion = (): void => {
  const region = detectDeploymentRegion();
  if (region) {
    process.env.DATABASE_REGION = region;
    console.log(`Set DATABASE_REGION to: ${region}`);
  } else {
    console.log(
      'DATABASE_REGION not set - will use fallback replica selection',
    );
  }
};

/**
 * Get the current database region (detecting if not already set).
 */
export const getDatabaseRegion = (): string | null => {
  return process.env.DATABASE_REGION || detectDeploymentRegion();
};
