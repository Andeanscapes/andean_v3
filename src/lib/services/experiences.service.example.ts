/**
 * EXAMPLE: Future API Integration
 * 
 * This file shows how to integrate with a real backend API.
 * Copy this into experiences.service.ts when backend is ready.
 */

import type { ExperienceData } from '../experiences/types';
import { EMERALD_MINING_DATA } from '../experiences-config/emeraldMining.config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.andeanscapes.com';

/**
 * Fetch experience data from API
 * Falls back to mock data if API fails (resilient)
 */
export async function getExperienceData(
  experienceId: string
): Promise<ExperienceData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/experiences/${experienceId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
        // 'Authorization': `Bearer ${process.env.API_SECRET}`,
      },
      next: {
        revalidate: 3600, // ISR: Cache for 1 hour
        tags: ['experience', experienceId], // For on-demand revalidation
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Validate data structure (optional but recommended)
    if (!data.config || !data.transportOptions || !data.roomModes) {
      throw new Error('Invalid API response structure');
    }

    return data as ExperienceData;

  } catch (error) {
    console.error('[ExperienceService] API error:', error);
    
    // Fallback to mock data for resilience
    return getFallbackData(experienceId);
  }
}

/**
 * Fallback to mock data when API is unavailable
 */
function getFallbackData(experienceId: string): ExperienceData {
  console.warn(`[ExperienceService] Using fallback data for: ${experienceId}`);
  
  switch (experienceId) {
    case 'emeraldMining':
      return EMERALD_MINING_DATA;
    
    // Add more experiences here
    // case 'pottery':
    //   return POTTERY_DATA;
    
    default:
      throw new Error(`No fallback data available for: ${experienceId}`);
  }
}

/**
 * Server-side wrapper (for SSR)
 * Adds error handling and logging
 */
export async function getExperienceDataSSR(
  experienceId: string
): Promise<ExperienceData> {
  const startTime = Date.now();
  
  try {
    const data = await getExperienceData(experienceId);
    
    const duration = Date.now() - startTime;
    console.log(`[ExperienceService] Fetched ${experienceId} in ${duration}ms`);
    
    return data;
  } catch (error) {
    console.error('[ExperienceService] Fatal error:', error);
    throw error;
  }
}

/**
 * Client-side fetch (if needed for dynamic updates)
 */
export async function getExperienceDataClient(
  experienceId: string
): Promise<ExperienceData> {
  const response = await fetch(`/api/experiences/${experienceId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch experience data');
  }

  return response.json();
}

/* 
 * ON-DEMAND REVALIDATION EXAMPLE
 * 
 * Create a Server Action to revalidate cache:
 * 
 * File: src/app/actions/revalidate.ts
 * -----------------------------------
 * 'use server';
 * 
 * import { revalidateTag } from 'next/cache';
 * 
 * export async function revalidateExperienceAction(experienceId: string) {
 *   revalidateTag('experience');
 *   revalidateTag(experienceId);
 * }
 */

/* 
 * EXAMPLE API ROUTE (if using Next.js API routes):
 * 
 * File: src/app/api/experiences/[id]/route.ts
 * 
 * import { NextResponse } from 'next/server';
 * import { getExperienceData } from '@/lib/services/experiences.service';
 * 
 * export async function GET(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   try {
 *     const data = await getExperienceData(params.id);
 *     return NextResponse.json(data);
 *   } catch (error) {
 *     return NextResponse.json(
 *       { error: 'Experience not found' },
 *       { status: 404 }
 *     );
 *   }
 * }
 */
