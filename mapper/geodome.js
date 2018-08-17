function isNewPoint(l, p){
    let found = l.find(function(x){
        return x.equals(p)
    })
    console.log(typeof found === "undefined")
    return typeof found === "undefined"
}

function subdivide(vec1, vec2, vec3, sphere_points, depth){
    let v1 = vec1.clone()
    let v2 = vec2.clone()
    let v3 = vec3.clone()
    if(depth == 0){
        if (isNewPoint(sphere_points,v1)) 
            sphere_points.push(v1)
        if (isNewPoint(sphere_points,v2)) 
            sphere_points.push(v2)
        if (isNewPoint(sphere_points,v3)) 
            sphere_points.push(v3)
        return
    }
    let v12 = new THREE.Vector3().addVectors(v1,v2).normalize()
    let v23 = new THREE.Vector3().addVectors(v2,v3).normalize()
    let v31 = new THREE.Vector3().addVectors(v3,v1).normalize()
    subdivide(v1, v12, v31, sphere_points, depth - 1)
    subdivide(v2, v23, v12, sphere_points, depth - 1)
    subdivide(v3, v31, v23, sphere_points, depth - 1)
    subdivide(v12, v23, v31, sphere_points, depth - 1)
}

function initialize_sphere(depth){
    let X = .525731112119133606
    let Z = .850650808352039932
    // Verticies of our icosahedron
    let verticies = [
        [-X, 0.0, Z], [ X, 0.0, Z ], [ -X, 0.0, -Z ], [ X, 0.0, -Z ],
        [ 0.0, Z, X ], [ 0.0, Z, -X ], [ 0.0, -Z, X ], [ 0.0, -Z, -X ],
        [ Z, X, 0.0 ], [ -Z, X, 0.0 ], [ Z, -X, 0.0 ], [ -Z, -X, 0.0 ]
    ]
    let verts = verticies.map(v => new THREE.Vector3(v[0],v[1],v[2]))
    // Faces (Vertex index mappings)
    let faces = [
        [0, 4, 1], [ 0, 9, 4 ], [ 9, 5, 4 ], [ 4, 5, 8 ], [ 4, 8, 1 ],
        [ 8, 10, 1 ], [ 8, 3, 10 ], [ 5, 3, 8 ], [ 5, 2, 3 ], [ 2, 7, 3 ],
        [ 7, 10, 3 ], [ 7, 6, 10 ], [ 7, 11, 6 ], [ 11, 0, 6 ], [ 0, 1, 6 ],
        [ 6, 1, 10 ], [ 9, 0, 11 ], [ 9, 11, 2 ], [ 9, 2, 5 ], [ 7, 2, 11 ]
    ]
    points = []
    for(let f of faces){
        subdivide(verts[f[0]], verts[f[1]], verts[f[2]], points, depth)
    }
    return points
}

var up = new THREE.Vector3(1,0,0)

class Dome {
    constructor(order, size){
        this.verts = initialize_sphere(order)
        // Make the top vertex the center of the pentagonal section
        this.verts.forEach(v => v.applyAxisAngle(up,35*(180 / Math.PI)).multiplyScalar(size))
        // Cut off bottom of dome to make sphere
        this.verts = this.verts.filter(v => v.z >= -0.1)
        // Save the scale for later
        this.scale = size
    }

    verticies(){
        let verts = []
        for(let v of this.verts){
            verts.push([v.x,v.y,v.z])
        }
        return verts
    }

    getVertexByPosition(v){
        
    }

    getNeighbors(vertexID){
        // Just grab all the distances, look at the smallest, * by 1.5ish and that's yer threshold
    }

    render(){
        // Render lines / LEDs between neighboring verticies 
    }

    // TODO: come up with good way to identify verticies
    // i.e: how do sort this list??
}
