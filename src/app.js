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
        require('./scripts/index.js');
    }
})();
