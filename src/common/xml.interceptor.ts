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

          // xml-js can produce invalid XML when given a plain string (e.g. "Hello Worlds!").
          // Wrap primitives so the response is always valid XML.
          const isPrimitive =
            data === null ||
            data === undefined ||
            typeof data === 'string' ||
            typeof data === 'number' ||
            typeof data === 'boolean';

          const xmlInput = isPrimitive
            ? { response: { _text: data == null ? '' : String(data) } }
            : data;

          const xmlData = js2xml(xmlInput, {
            compact: true,
            ignoreComment: true,
            spaces: 2,
          });

          return xmlData;
        }),
      );
    }

    return next.handle();
  }
}