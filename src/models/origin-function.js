module.exports = `
function drawOrigin() {
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

  let arrowX = color("Red", polyhedron({points: pointsOrigin, triangles: trianglesOrigin}).translate([3,0,0]));
  swing(pointsOrigin);
  let arrowY = color("Green", polyhedron({points: pointsOrigin, triangles: trianglesOrigin}).translate([0,3,0]));
  swing(pointsOrigin);
  let arrowZ = color("Blue", polyhedron({points: pointsOrigin, triangles: trianglesOrigin}).translate([0,0,3]));

  return union(arrowX, arrowY, arrowZ);
}
`;
