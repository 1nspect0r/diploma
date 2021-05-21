import './styles/index.scss';

require('bootstrap/dist/js/bootstrap');
require('bootstrap/dist/css/bootstrap.css');

if (process.env.NODE_ENV === 'development') {
    require('./index.html');
}

(function () {
    document.addEventListener("DOMContentLoaded", function () {
        main();
    });

    // application entry point
    function main() {
        require('./scripts/index.js');
    }
})();
