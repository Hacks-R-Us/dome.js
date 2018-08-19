class Dome {
    constructor(order, size, scene){
        // Save the scale for later
        this.scale = size
        
        // --== Calculate verticies ==--
        // _verts is "private" and its order has to remain static for edge mapping
        this._verts = initialize_sphere(order)
        // Make the top vertex the center of the pentagonal section & scale
        let ax = new THREE.Vector3(0,0,1)
        this._verts.forEach(v => v.applyAxisAngle(ax,35*(180 / Math.PI)).multiplyScalar(this.scale))
        // Cut off bottom of sphere to make DOME
        this._verts = this._verts.filter(v => v.y >= -0.1)

        // --== Find edges ==--
        this._struts = []
        this._edges = []
        this._strut_types = []
        for(let i=0; i<this._verts.length; i++){
            let neighbors = this.getNeighbors(i)
            for(let n of neighbors){
                this.addEdge([i,n])
            }
        }
        this._strut_types.sort()
        // Convert edges to struts
        for (let e of this._edges){
            this._struts.push(new Strut(this._verts[e[0]], this._verts[e[1]], this._strut_types))
        }
            

        // --== Set up THREE geometry ==--
        // Verticies
        let vertexCollisionMesh = new THREE.SphereBufferGeometry(0.1, 6, 4)
        let collisionMeshMaterial = new THREE.MeshBasicMaterial({visible: false})
        //let collisionMeshMaterial = new THREE.MeshBasicMaterial({color: 0xffff00})
        this._vertex_meshes = []
        this._vertex_groups = []
        console.log(this._verts)
        console.log(this._edges)
        for(let v of this._verts){
            let sphere = new THREE.Mesh(vertexCollisionMesh, collisionMeshMaterial)
            sphere.position.set(v.x,v.y,v.z)
            scene.add(sphere)
            this._vertex_meshes.push(sphere)
        }

    }

    addEdge(edge){
        let e = edge.slice().sort()
        let found = this._edges.find(a => a[0] == e[0] && a[1] == e[1])
        if(typeof found === "undefined"){
            this._edges.push(e)
        }
    }

    verticies(){
        let verts = []
        for(let v of this._verts){
            verts.push([v.x,-v.z,v.y])
        }
        return verts
    }

    getVertexByPosition(v){
        
    }

    getNeighbors(vertexID){
        // Get all distances to other points
        let distances = []
        for(let v of this._verts){
            distances.push(this._verts[vertexID].distanceTo(v))
        }
        // Find single-strut approx. dist
        let smallest_dist = distances.slice().sort()[1]
        // Get indicies of single-strut neighbors
        let neighbors = []
        for(let i=0; i<this._verts.length; i++){
            if(distances[i] != 0 && distances[i] < smallest_dist * 1.5){
                neighbors.push(i)
                let strutLen = Math.round(distances[i] * 1000) / 1000
                if(!this._strut_types.includes(strutLen)){
                    this._strut_types.push(strutLen)
                }
            }
        }
        return neighbors
    }

    render(){
        // Render lines / LEDs between neighboring verticies 
    }

    // TODO: come up with good way to identify verticies
    // i.e: how do sort this list??
}

function isNewPoint(l, p){
    let found = l.find(function(x){
        return x.equals(p)
    })
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
        [ 0, 4, 1], [ 0, 9, 4 ], [ 9, 5, 4 ], [ 4, 5, 8 ], [ 4, 8, 1 ],
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
