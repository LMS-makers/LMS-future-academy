import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, path: string) {
    const config = new DocumentBuilder()
        .setTitle('LMS Future Academy API')
        .setDescription('API documentation for the Future Academy LMS')
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'access-token',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(path, app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
}