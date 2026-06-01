import { redis } from "../config/redis.js";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCache(key) {
  try {
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);

  } catch (error) {
    console.error(
      `Error getting cache for key ${key}:`,
      error
    );

    return null;
  }
}

export async function setCache(
  key,
  value,
  ttl = DEFAULT_TTL
) {
  try {

    await redis.set(
      key,
      JSON.stringify(value),
      "EX",
      ttl
    );

  } catch (error) {

    console.error(
      `Error setting cache for key ${key}:`,
      error
    );
  }
}

export async function deleteCache(key) {
  try {

    await redis.del(key);

    console.log(
      `Cache Invalidated: ${key}`
    );

  } catch (error) {

    console.error(
      `Error deleting cache ${key}:`,
      error
    );
  }
}

export async function exists(key) {
  return await redis.exists(key);
}