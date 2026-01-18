import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { js2xml } from 'xml-js';

@Injectable()
export class XmlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const accept = request.headers.accept;

    if (accept && accept.includes('application/xml')) {
      return next.handle().pipe(
        map(data => {
          response.set('Content-Type', 'application/xml');
          // Convert JSON data to XML
          const xmlData = js2xml(data, { compact: true, ignoreComment: true, spaces: 2 });
          return xmlData;
        }),
      );
    }

    return next.handle();
  }
}