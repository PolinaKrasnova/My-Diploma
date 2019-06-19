const { execSync } = require('child_process');

const Compiler = {
  compile(filePath) {
    console.log(filePath);
    console.log(`npx puml generate ${filePath} -o ${filePath}.jpg`);
    execSync(`npx puml generate ${filePath} -o ${filePath}.jpg -C utf-8`);
  },
};
