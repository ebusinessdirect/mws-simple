export default (file: string, data: string) => {
    const fs = require('fs'); // non-global require because fs functions are mostly only used in development, so no need to require them for most uses
    fs.writeFileSync(file, data);
};
