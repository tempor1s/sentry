import redis from 'redis';
import { promisify } from 'util';
import { redisUrl, redisPassword } from '../config';

const redisClient = redis.createClient(redisUrl, { password: redisPassword });

// set up async get/set
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

export { redisClient, getAsync, setAsync };
