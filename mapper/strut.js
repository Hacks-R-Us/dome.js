var STRUTS = {
	"A": {"length": .662, "leds": 35, "color": 0x880000},
	"B": {"length": .772, "leds": 41, "color": 0x000088},
	"C": {"length": .772, "leds": 41, "color": 0x004400},
	"D": {"length": .818, "leds": 44, "color": 0x888800},
	"E": {"length": .850, "leds": 46, "color": 0x880088},
	"F": {"length": .781, "leds": 42, "color": 0x008888},
}
var TYPES = ["F","C","D","B","E"]
//var lineMaterial = new THREE.LineBasicMaterial({color: 0x666666})
class Strut {
	constructor(v1, v2, types){
		// Set points of ends
		this._start = v1.clone()
		this._end = v2.clone()
		this._reversed = false
		this.covered = false
		
		// Determine Strut type
		let len = v1.distanceTo(v2)
		let roundedLen = Math.round(len*100000)/100000
		let index = types.indexOf(roundedLen)
		if(index == -1) 
			throw new Error("No strut type with length " + roundedLen)
		this.strutType = TYPES[index]

		this._leds = []
	}

	initGeometry(){
		// Create geometry
        this._geometry = new THREE.BufferGeometry()
        let linePositions = new Float32Array(6)
        let lineMaterial = new THREE.LineBasicMaterial({color: this.color, linewidth: 3,})
        linePositions.set([this._start.x,this._start.y,this._start.z,this._end.x,this._end.y,this._end.z])
        this._geometry.addAttribute('position', new THREE.BufferAttribute(linePositions, 3))
        this._line = new THREE.Line(this._geometry, lineMaterial)
        scene.add(this._line)

        // Create Arrow
        this._arrow = new THREE.ArrowHelper(this.dir, this.center, 0.11, this.color, 0.079, 0.08)
		scene.add(this._arrow)
	}

	generateLEDPositions(){
		for(let i = 0; i < this.numLeds; i++){
			let LED = new THREE.Vector3()
			LED.lerpVectors(this._start, this._end, (i/(this.numLeds-1))*0.9 + 0.05) // Add 5% padding either side
			this._leds.push(LED)
		}
		if(this._reversed){
			this._leds.reverse()
		}
	}

	reverse(){
		this._leds.reverse()
		this._reversed = true
		this._arrow.setDirection(this.dir)
	}

	// Properties
	get numLeds()   {return STRUTS[this.strutType].leds}
	get color()  {return this.covered ? 0x222222 : STRUTS[this.strutType].color}
	set color(c) {
		this._line.material.color.setHex(c)
		//this._arrow.setColor(c)
		this._line.material.needsUpdate = true
	}
	resetColor() {this.color = this.color}
	set type(t) {
		this.strutType = t
	}
	get ledPositions(){
		if (this._leds.length == 0){
			this.generateLEDPositions()
		}
		return this._leds.map(v => [v.x,v.y,v.z].map(n => Math.round(n*10000)/10000))
	}
	// Vectory properties
	get start()  {return this._start.clone()}
	set start(v) {this._start = v.clone()}
	get end()    {return this._end.clone()}
	set end(v)   {this._end = v.clone()}
	get length() {return this.start.distanceTo(this.end)}
	get center() {return this.end.add(this.start).divideScalar(2)}
	get dir()    {
		let diff = new THREE.Vector3().subVectors(this._start, this._end)
		diff.normalize()
		if(this._reversed) diff.multiplyScalar(-1)
		return diff
	}
}
