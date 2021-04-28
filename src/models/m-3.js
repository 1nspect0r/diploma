module.exports = `
function example03() {
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
function example04() {
    let a = cylinder({r: 10, h: 20}).rotateY(90); // .translate([20, 40, 0])
    return a;
}
function example05() {
    rad1 = 10;
    function countH() {
        function degToRad(deg1) {
            return deg1 * (Math.PI/180);
        }
        let ekis = rad1 / 2 * Math.tan(degToRad(30));
        return ekis;
    }
    let g = cylinder({r1: rad1, r2: 0, h: countH()});
}
function example06() {

    let a = cylinder({r: 10, h: 20}).rotateY(90);

/*
    let a = unite(
        b,
        c.rotateY(180)
    ).translate([0, 0, -4]);
*/

    return b;
}
function example07() {
    let a = cylinder({r: 4, h: 6});
    let b = cylinder({r1: 4, r2: 0, h: 2}).rotateY(180);
    return b;
}
function example08() {

    let a = difference(
        cylinder({r: 7, h: 10}),
        cylinder({r: 3, h: 10})
    ).translate([6, 6, -10]);

    return a;
}
function example09() { // NOT YET SOLVED !!!

    // index          0  1  2  3  4   5
    // listaWymiarów: 5, 5, 4, 8, 10, 2
    // 1. dimension = 0 - the main problem, causes crash
    // 2. cylinders overlap twice

    let a = union(
        cube({size: [4, 4, 10]}).translate([0, 2, 0]),
        cube({size: [0, 8, 10]}).translate([2, 0, 0]),  // dimension (1.)
        cylinder({r: 2, h: 10}).translate([2, 2, 0]),
        cylinder({r: 2, h: 10}).translate([2, 6, 0]),
        cylinder({r: 2, h: 10}).translate([2, 2, 0]),   // overlap (2.)
        cylinder({r: 2, h: 10}).translate([2, 6, 0])    // overlap (2.)
    ).translate([5, 5, -10]);

    return a;
}
function example10() {

    let a = union(
        cube({size: [4, 4, 10]}).translate([0, 2, 0]),
        cylinder({r: 2, h: 10}).translate([2, 2, 0]),
        cylinder({r: 2, h: 10}).translate([2, 6, 0]),
        cylinder({r: 2, h: 10}).translate([2, 2, 0]),   // overlap (2.)
        cylinder({r: 2, h: 10}).translate([2, 6, 0])    // overlap (2.)
    ).translate([5, 5, -10]);

    return a;
}
function example11() {
    let model =
        union(
            drawOrigin([[10, 0, 0], [0, 50, 0], [0, 0, 0]]),
            difference(
                cube({size: [10, 50, 2]}).translate([0, 0, -2]),
                union(
                    cylinder({r: 2.5, h: 1}),
                    cylinder({r1: 2.5, r2: 0, h: 0.7216878364870322}).rotateY(180)
                ).translate([5, 10, -1]),
                union(
                    cylinder({r: 2.5, h: 1}),
                    cylinder({r1: 2.5, r2: 0, h: 0.7216878364870322}).rotateY(180)
                ).translate([5, 10, -1])
            )
        ).translate([-5, -25, 0]);

    return model;
}
function example12() {

    let a = union(cylinder({r: 2.5, h: 1}), cylinder({r1: 2.5, r2: 0, h: 0.7216878364870322}).rotateY(180)).translate([5, 10, -1]);
    let b = union(cylinder({r: 2.5, h: 1}), cylinder({r1: 2.5, r2: 0, h: 0.7216878364870322}).rotateY(180)).translate([5, 10, -1]);
    let c = cube({size: [10, 50, 2]}).translate([0, 0, -2]);

    let model =
        union(
            drawOrigin([[10, 0, 0], [0, 50, 0], [0, 0, 0]]),
            difference(
                c,
                b,
                a
            )
        ).translate([-5, -25, 0]);

    return a;
}
function example13() {
    // R = 5, l = 2, h = 1, x0 = 10, y0 = 10
    let a = difference(cylinder({r: 4, h: 1}), cylinder({r: 6, h: 1})).translate([10, 10. -1]);
    return a;
}
function main () {
    //return cube();



    return b;
    //return example13();
}




//
function drawOrigin(trans) {

    // trans is a matrix 3x3, an array of 3 arrays of 3 numbers each
    let transX = trans[0];
    let transY = trans[1];
    let transZ = trans[2];

    let trianglesOrigin = [
        [0,1,2],
        [0,3,1],
        [1,4,2],
        [1,3,4],
        [0,2,4],
        [0,4,3]
    ];
    let pointsOrigin = [
        [0,0,0],
        [7,0,0],
        [1,1,0],
        [1,0,1],
        [1,1,1]
    ];
    function swing(listOfLists) {
        for (let list of listOfLists) {
            let registerCarry = list[2];
            list[2] = list[1];
            list[1] = list[0];
            list[0] = registerCarry;
        }
    }

    let arrowX = color("Red", polyhedron({points: pointsOrigin, triangles: trianglesOrigin})).translate([3,0,0]).translate([transX[0], transX[1], transX[2]]);
    swing(pointsOrigin);
    let arrowY = color("Green", polyhedron({points: pointsOrigin, triangles: trianglesOrigin})).translate([0,3,0]).translate([transY[0], transY[1], transY[2]]);
    swing(pointsOrigin);
    let arrowZ = color("Blue", polyhedron({points: pointsOrigin, triangles: trianglesOrigin})).translate([0,0,3]).translate([transZ[0], transZ[1], transZ[2]]);

    return union(arrowX, arrowY, arrowZ);
}
`;
