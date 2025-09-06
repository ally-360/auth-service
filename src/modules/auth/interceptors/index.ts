import { LoggingInterceptor } from './logging.interceptor';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

export { LoggingInterceptor } from './logging.interceptor';
export { ResponseTransformInterceptor } from './response-transform.interceptor';

export const Interceptors = [LoggingInterceptor, ResponseTransformInterceptor];
