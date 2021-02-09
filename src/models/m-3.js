module.exports = `
function example003() {
    let rad1 = 10;
    let a = cylinder({r: 20, h: 200});
    let b = cylinder({r: rad1, h: 40});
    let c = a.rotateY(90);
    let d = b.rotateY(90);
    let e = cube({size: [200, 50, 50]});
    let f = e.translate([0, -50, 0]);
    function countH() {
        function degToRad(deg1) {
            return deg1 * (Math.PI/180);
        }
        let ekis = rad1 / 2 * Math.tan(degToRad(30));
        return ekis;
    }
    let g = cylinder({r1: rad1, r2: 0, h: countH()});
    let h = g.rotateY(90).translate([40, 0, 0]);
    let model1 = difference(c, d, f, h);
    return model1;
}

function main () {
    return example003();
}
`;
