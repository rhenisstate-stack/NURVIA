import { NextResponse } from 'next/server';
import { getSkewLineServerConfig } from '@/lib/api-config.mjs';

export async function GET() {
  try {
    const cfg = getSkewLineServerConfig(process.env);
    return NextResponse.json({
      success: true,
      data: {
        appName: cfg.appName,
        appTitle: cfg.appTitle,
        appDomainConfigured: cfg.appDomainConfigured,
        appKeyConfigured: cfg.appKeyConfigured,
        activeBackend: cfg.activeBackend,
        isHttps: cfg.isHttps,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Backend configuration error.',
      },
      { status: 503 }
    );
  }
}
