import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import yaml from 'yaml';

const swaggerfile = readFileSync('./Service/swagger.yaml', 'utf8');
const swaggerDoc = yaml.parse(swaggerfile);

const options = {
  definition: swaggerDoc,
  apis: ['./Routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };