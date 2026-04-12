import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Composed decorator for Caching.
 * Automatically applies CacheInterceptor and sets the TTL.
 * 
 * @param ttl Time to live in seconds (default: 300)
 */
export function Cacheable(ttl: number = 300) {
    return applyDecorators(
        UseInterceptors(CacheInterceptor),
        CacheTTL(ttl),
    );
}
