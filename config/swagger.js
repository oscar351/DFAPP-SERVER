const swaggerUi = require("swagger-ui-express");
const swaggereJsdoc = require("swagger-jsdoc");
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const fs = require('fs');
const path = require('path');

const options = {
  apis: ["./routes/*.js"], //Swagger 파일 연동
};

const doc = {
  info: {
    version: '1.0.0', // by default: '1.0.0'
    title: '이기민의 API', // by default: 'REST API'
    description: '프로젝트 설명 Node.js Swagger swagger-jsdoc 방식 RestFul API 클라이언트 UI', // by default: ''
  },
  servers: [
    {
      url: 'http://localhost:5000', // by default: 'http://localhost:3000'
      description: '개발 서버', // by default: ''
    },
  ],
  tags: [ // by default: empty Array
    {
      name: 'User API', // Tag name
      description: '사용자 관련 API', // Tag description
    },
  ],
};

// 디렉토리 내 모든 파일 경로 가져오기
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const outputFile = './config/swagger-output.json';
const endpointsDir = './routes'; // 엔드포인트 파일이 있는 디렉토리
const endpointsFiles = getAllFiles(endpointsDir);

// Swagger 문서 생성
async function generateSwaggerDocs() {
  try {
    await swaggerAutogen(outputFile, endpointsFiles, doc);
  } catch (error) {
    console.error('Error generating Swagger documentation:', error);
  }
}

generateSwaggerDocs();
