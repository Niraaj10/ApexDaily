import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

if (process.env.NODE_ENV === "development") {
    redis.ping()
        .then((res) => console.log("✅ Redis connected:", res))
        .catch((err) => console.error("❌ Redis connection failed:", err));
}

await redis.set("foo", "bar");
await redis.get("foo");


// CACHE KEY BUILDERS
 
export const CK = {
  // Task cache keys
  tasks: (workspaceId: string) => `ws:${workspaceId}:tasks`,
  task: (taskId: string) => `task:${taskId}`,
  
  // Workspace cache keys
  workspace: (workspaceId: string) => `ws:${workspaceId}`,
  workspaces: (userId: string) => `user:${userId}:workspaces`,
  
  // Analytics cache keys
  analytics: (workspaceId: string) => `ws:${workspaceId}:analytics`,
  
  // Habit cache keys
  habits: (userId: string) => `user:${userId}:habits`,
  habitLogs: (habitId: string) => `habit:${habitId}:logs`,
  
  // User cache keys
  user: (userId: string) => `user:${userId}`,
  
  // Session cache keys
  session: (sessionId: string) => `session:${sessionId}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
  
  // CSRF cache keys
  csrf: (sessionId: string) => `csrf:${sessionId}`,
  
  // Idempotency keys
  idempotency: (key: string) => `idem:${key}`,
};
 

// CACHE OPERATIONS

 
/**
 * Get value from cache
 */
export async function get<T = any>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value as T | null;
  } catch (error) {
    console.error("[Cache] Get error:", error);
    return null;
  }
}
 
/**
 * Set value in cache with optional TTL
 */
export async function set(
  key: string,
  value: any,
  ttl?: number // TTL in seconds
): Promise<boolean> {
  try {
    if (ttl) {
      await redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error("[Cache] Set error:", error);
    return false;
  }
}
 
/**
 * Delete single key from cache
 */
export async function del(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("[Cache] Delete error:", error);
    return false;
  }
}
 
/**
 * Invalidate cache keys matching pattern
 */
export async function invalidate(pattern: string): Promise<boolean> {
  try {
    // Get all keys matching pattern
    const keys = await redis.keys(pattern);
    
    if (keys && keys.length > 0) {
      // Delete all matching keys
      await redis.del(...keys);
    }
    
    return true;
  } catch (error) {
    console.error("[Cache] Invalidate error:", error);
    return false;
  }
}
 
/**
 * Get or set with cache-aside pattern
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // Default 5 minutes
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    // Cache miss - fetch data
    const data = await fetcher();
    
    // Store in cache
    await set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error("[Cache] Cached error:", error);
    // On error, just fetch without caching
    return await fetcher();
  }
}
 
/**
 * Check if key exists
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error("[Cache] Exists error:", error);
    return false;
  }
}
 
/**
 * Set key with expiration
 */
export async function expire(key: string, seconds: number): Promise<boolean> {
  try {
    await redis.expire(key, seconds);
    return true;
  } catch (error) {
    console.error("[Cache] Expire error:", error);
    return false;
  }
}
 
/**
 * Get time to live for a key
 */
export async function ttl(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error("[Cache] TTL error:", error);
    return -1;
  }
}
 
/**
 * Increment a counter
 */
export async function incr(key: string): Promise<number> {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error("[Cache] Incr error:", error);
    return 0;
  }
}
 
/**
 * Decrement a counter
 */
export async function decr(key: string): Promise<number> {
  try {
    return await redis.decr(key);
  } catch (error) {
    console.error("[Cache] Decr error:", error);
    return 0;
  }
}
 
/**
 * Add item to a set
 */
export async function sadd(key: string, ...members: string[]): Promise<number> {
  try {
    // return await redis.sadd(key, ...members);
    return await redis.sadd(key, ...(members as [string, ...string[]]) );
  } catch (error) {
    console.error("[Cache] Sadd error:", error);
    return 0;
  }
}
 
/**
 * Remove item from a set
 */
export async function srem(key: string, ...members: string[]): Promise<number> {
  try {
    return await redis.srem(key, ...members);
  } catch (error) {
    console.error("[Cache] Srem error:", error);
    return 0;
  }
}
 
/**
 * Get all members of a set
 */
export async function smembers(key: string): Promise<string[]> {
  try {
    return await redis.smembers(key);
  } catch (error) {
    console.error("[Cache] Smembers error:", error);
    return [];
  }
}
 
/**
 * Check if member exists in set
 */
export async function sismember(
  key: string,
  member: string
): Promise<boolean> {
  try {
    const result = await redis.sismember(key, member);
    return result === 1;
  } catch (error) {
    console.error("[Cache] Sismember error:", error);
    return false;
  }
}
 
// EXPORT ALL
 
export default {
  redis,
  CK,
  get,
  set,
  del,
  invalidate,
  cached,
  exists,
  expire,
  ttl,
  incr,
  decr,
  sadd,
  srem,
  smembers,
  sismember,
};