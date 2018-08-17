var STRUTS = {
	"A": {"length": 66.2, "leds": 30, "hue": 0  },
	"B": {"length": 77.2, "leds": 41, "hue": 240},
	"C": {"length": 77.0, "leds": 41, "hue": 120},
	"D": {"length": 81.8, "leds": 44, "hue": 60 },
	"E": {"length": 85.0, "leds": 46, "hue": 300},
	"F": {"length": 78.1, "leds": 42, "hue": 180},
}

class Strut {
	constructor(name){
		this.name = name
		// Position
		this._base = new THREE.Vector3(0,0,0)
		this.tail = new THREE.Vector3(this.length,0,0)
	}

	// Properties
	get length(){
		return STRUTS[this.name].length
	}
	get leds(){
		return STRUTS[this.name].leds
	}
	get color(){
		return STRUTS[this.name].hue
	}

	set base(vec){
		this._base = vec.clone()
	}
	set direction(vec){
		this.tail = vec.clone()
		this.tail.setLength(this.length)
	}
	get end(){
		return this._base.clone().add(this.tail)
	}
	get center(){
		return this._base.clone().add(this.tail.clone().multiplyScalar(0.5))
	}

	// Methods
	render2D() {
		stroke(this.color,1,1)
		let end = this.end
		line(this._base.x, this._base.y, end.x, end.y)
	}
	rotateAround(axis, amount){
		let newBase = this._base.rotateAround(axis, amount)
		let newTail = this._base.rotateAround(axis, amount)
		let newStrut = new Strut(this.name)
		newStrut.base = newBase
		newStrut.direction = newTail
		return newStrut
	}
}
