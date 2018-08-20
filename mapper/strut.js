var STRUTS = {
	"A": {"length": .662, "leds": 30, "color": 0x880000},
	"B": {"length": .772, "leds": 41, "color": 0x000088},
	"C": {"length": .772, "leds": 41, "color": 0x004400},
	"D": {"length": .818, "leds": 44, "color": 0x888800},
	"E": {"length": .850, "leds": 46, "color": 0x880088},
	"F": {"length": .781, "leds": 42, "color": 0x444444},
}
var TYPES = ["F","C","D","B","E"]
//var lineMaterial = new THREE.LineBasicMaterial({color: 0x666666})
class Strut {
	constructor(v1, v2, types){
		// Set points of ends
		this._start = v1.clone()
		this._end = v2.clone()
		
		// Determine Strut type
		let len = v1.distanceTo(v2)
		let roundedLen = Math.round(len*100000)/100000
		let index = types.indexOf(roundedLen)
		if(index == -1) 
			throw new Error("No strut type with this length!")
		this.strutType = TYPES[index]
	}

	initGeometry(){
		// Create geometry
        this._geometry = new THREE.BufferGeometry()
        let linePositions = new Float32Array(6)
        let lineMaterial = new THREE.LineBasicMaterial({color: this.color, linewidth: 5,})
        linePositions.set([this._start.x,this._start.y,this._start.z,this._end.x,this._end.y,this._end.z])
        this._geometry.addAttribute('position', new THREE.BufferAttribute(linePositions, 3))
        this._line = new THREE.Line(this._geometry, lineMaterial)
        scene.add(this._line)
	}

	// Properties
	get leds()   {return STRUTS[this.strutType].leds}
	get color()  {return STRUTS[this.strutType].color}
	set color(c) {
		this._line.material.color.setHex(c)
		this._line.material.needsUpdate = true
	}
	set type(t) {
		this.strutType = t
	}
	// Vectory properties
	get start()  {return this._start.clone()}
	set start(v) {this._start = v.clone()}
	get end()    {return this._end.clone()}
	set end(v)   {this._end = v.clone()}
	get length() {return this.start.distanceTo(this.end)}
	get center() {return this.end.add(this.start).divideScalar(2)}
}
