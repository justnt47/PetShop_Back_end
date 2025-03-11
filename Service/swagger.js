import swaggerAutogen from 'swagger-autogen';

const swaggerAutogenInstance = swaggerAutogen();

const doc = {
  info: {
    title: 'KUSHOP API',
    description: 'KUSHOP Project from Kasetsart University Sriracha Campus.',
    version: '1.0.0',
    
  },
  // host: 'localhost:3000',
  schemes: ['http'],
  
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./index.js']; // Path to your main file where routes are defined

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
  // import('../index.js'); // Your project's root file
  console.log('✅ Swagger JSON generated successfully');
  process.exit();
});