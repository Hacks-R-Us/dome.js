var STRUTS = {
	"A": {"length": .662, "leds": 30, "color": 0xff0000},
	"BC":{"length": .772, "leds": 41, "color": 0x00ffff},
	"D": {"length": .818, "leds": 44, "color": 0xffff00},
	"E": {"length": .850, "leds": 46, "color": 0xff00ff},
	"F": {"length": .781, "leds": 42, "color": 0xaaaaaa},
}
var TYPES = ["A","BC","D","E","F"]
//var lineMaterial = new THREE.LineBasicMaterial({color: 0x666666})
class Strut {
	constructor(v1, v2, types){
		// Set points of ends
		this._start = v1.clone()
		this._end = v2.clone()
		
		// Determine Strut type
		let len = v1.distanceTo(v2)
		let roundedLen = Math.round(len*1000)/1000
		let index = types.indexOf(roundedLen)
		if(index == -1) 
			throw new Error("No strut type with this length!")
		this.strutType = TYPES[index]

		// Create geometry
        this._geometry = new THREE.BufferGeometry()
        let linePositions = new Float32Array(6)
        let lineMaterial = new THREE.LineBasicMaterial({color: this.color})
        linePositions.set([v1.x,v1.y,v1.z,v2.x,v2.y,v2.z])
        this._geometry.addAttribute('position', new THREE.BufferAttribute(linePositions, 3))
        this._line = new THREE.Line(this._geometry, lineMaterial)
        scene.add(this._line)
	}

	// Properties
	get leds()   {return STRUTS[this.strutType].leds}
	get color()  {return STRUTS[this.strutType].color}
	set color(c) {
		this._line.material = new THREE.Color(c)
		this._line.material.needsUpate = true
		console.log("Set the color!",c)
	}
	// Vectory properties
	get start()  {return this._start.clone()}
	set start(v) {this._start = v.clone()}
	get end()    {return this._end.clone()}
	set end(v)   {this._end = v.clone()}
	get length() {return this.start.distanceTo(this.end)}
	get center() {return this.end.add(this.start).divideScalar(2)}

	// Methods
	rotateAround(axis, amount){
		let newBase = this._base.rotateAround(axis, amount)
		let newTail = this._base.rotateAround(axis, amount)
		let newStrut = new Strut(this.name)
		newStrut.base = newBase
		newStrut.direction = newTail
		return newStrut
	}
}
