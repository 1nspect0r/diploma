module.exports = `
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
