const AlertUserOfUncaughtExceptions = require('@jscad/web/src/ui/errorDispatcher');

const version = require('@jscad/web/package').version;
const Processor = require('@jscad/web/src/jscad/processor');

const versionText = 'OpenJSCAD.org Version ' + version + ' imported';
console.log(versionText);
AlertUserOfUncaughtExceptions();

let viewer = document.getElementById('viewerContext');
export const gProcessor = new Processor(viewer);
