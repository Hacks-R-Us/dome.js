var VERT_COLOR = 0x333333
var VERT_HOVER = 0xcccccc

class Dome {
    constructor(order, size, scene){

        // Save the scale for later
        this.scale = size
        // Currently hovered node for UI purposes
        this._hover = null
        
        // --== Calculate vertices ==--

        // _verts is "private" and its order has to remain static for edge mapping
        this._verts = initialize_sphere(order)
        // Make the top vertex the center of the pentagonal section & scale
        let ax = new THREE.Vector3(0,0,1)
        this._verts.forEach(v => v.applyAxisAngle(ax,35*(180 / Math.PI)).multiplyScalar(this.scale))
        // Cut off bottom of sphere to make DOME
        this._verts = this._verts.filter(v => v.y >= -0.1)
        // Sort verts by y then x then z - gives consistent order
        let base = this.scale * 10
        this._verts.sort( (a,b) => (b.y-a.y)*base*base + (b.x-a.x)*base + (b.z-a.z))

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

        // Sort edegs by startVert then endVert - gives consistent order
        base = this._edges.length
        this._edges.sort((a,b) => (b[0]-a[0])*base + (b[1]-a[1]))
        this._strut_types.sort()
        console.log(this._strut_types)
        // Convert edges to struts
        for (let e of this._edges){
            e = JSON.parse("[" + e + "]")
            this._struts.push(new Strut(this._verts[e[0]], this._verts[e[1]], this._strut_types))
        }

        // Correct for F and A struts somehow being the same length (??)
        for(let i=0; i<this._verts.length; i++){
            let pentCorners = this.getNeighbors(i)
            if(pentCorners.length == 5){
                for(let n of pentCorners){
                    let edgeID = this._edges.indexOf(String([i,n].sort()))
                    this._struts[edgeID].type = "A"
                }
            }
        }

        // --== Set up THREE geometry ==--
        // Edges
        this._struts.forEach(s => s.initGeometry())
        // Vertices
        let vertexCollisionMesh = new THREE.SphereBufferGeometry(0.15, 6, 4)
        //let collisionMeshMaterial = new THREE.MeshBasicMaterial({visible: false})
        let collisionMeshMaterial = new THREE.MeshBasicMaterial({color: VERT_COLOR})
        this._vertex_meshes = []
        for(let v of this._verts){
            let sphere = new THREE.Mesh(vertexCollisionMesh.clone(), collisionMeshMaterial.clone())
            sphere.position.set(v.x,v.y,v.z)
            scene.add(sphere)
            this._vertex_meshes.push(sphere)
            this._vertex_meshes_ids = this._vertex_meshes.map(m => m.uuid)
        }

    }

    get hover()   { return this._hover }
    set hover(vID){
        (document.readyState === "complete") && (document.getElementById("node").innerHTML = vID)
        if(vID != this._hover){
            if (this.hover != null)
                this._vertex_meshes[this.hover].material.color.setHex(VERT_COLOR)
            this._hover = vID
            if (this.hover != null)
                this._vertex_meshes[this.hover].material.color.setHex(VERT_HOVER)
        }
    }

    addEdge(edge){
        let e = String(edge.slice().sort())
        if(!this._edges.includes(e)){
            this._edges.push(e)
        }
    }

    getVerticesByMouse(){
        raycaster.setFromCamera(mouse, camera)
        let objects = raycaster.intersectObjects(this._vertex_meshes, true)
        let vertices = []
        for(let o of objects){
            let index = this._vertex_meshes_ids.indexOf(o.object.uuid)
            if(index != -1){
                vertices.push(index)
            }
        }
        return vertices
    }

    getStrutByVerts(a,b){
        let e = String([a,b].sort())
        return this._struts[this._edges.indexOf(e)]
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
                let strutLen = Math.round(distances[i] * 100000) / 100000
                if(!this._strut_types.includes(strutLen)){
                    this._strut_types.push(strutLen)
                }
            }
        }
        return neighbors
    }

    update(){
        // Hover over Verts
        let hovers = this.getVerticesByMouse()
        if(hovers.length > 0){
            this.hover = hovers[0]
        } else {
            this.hover = null
        }
    }
}

// Check if a vector p already exists in list l
function isNewPoint(l, p){
    let found = l.find(x => x.equals(p))
    return typeof found === "undefined"
}

// Split triangle into moar triangles
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
    // Vertices of our icosahedron
    let vertices = [
        [-X, 0.0, Z], [ X, 0.0, Z ], [ -X, 0.0, -Z ], [ X, 0.0, -Z ],
        [ 0.0, Z, X ], [ 0.0, Z, -X ], [ 0.0, -Z, X ], [ 0.0, -Z, -X ],
        [ Z, X, 0.0 ], [ -Z, X, 0.0 ], [ Z, -X, 0.0 ], [ -Z, -X, 0.0 ]
    ]
    let verts = vertices.map(v => new THREE.Vector3(v[0],v[1],v[2]))
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
