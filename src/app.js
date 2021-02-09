import './styles/index.scss';
import './styles/style.css';

if (process.env.NODE_ENV === 'development') {
    require('./index.html');
}

(function () {
    document.addEventListener("DOMContentLoaded", function () {
        main();
    });

    // application entry point
    function main() {
        // require('./scripts/auxilaryFunctions.js');
        // require('./scripts/objects.js');
        // import './scripts/activate.js';

        require('./scripts/index.js');

        // require('@jscad/web/min.css');
        // let gProcessor = require('./scripts/cad');

        // require('./scripts/draw-model');
    }
})();
