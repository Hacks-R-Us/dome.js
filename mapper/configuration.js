class Controller {
	constructor(id){
		// ID of this controller; links to IP address
		this.id = id
		// Ordered list of vertex IDs on controller's path
		this._nodeList = []
		// Ordered list of struts on controller's path
		this._struts = []

		this._highlighted = false
	}

	addNode(id){
		// Add a new node onto the end of this string
		this._nodeList.push(id)
		let l = this._nodeList.length
		if(l > 1){
			let strut
			try { 
				strut = dome.getStrutByVerts(this._nodeList[l-2], this._nodeList[l-1])
			} catch (ex){
				return
			}
			this._struts.push(strut)
			if(this._highlighted !== false){
				this._struts[this._struts.length - 1].color = this._highlighted
			}
		}
	}

	setStrutColors(color = 0xffffff){
		this._struts.forEach(s => s.color = color)
		this._highlighted = color
	}
	
	clearStrutColors(){
		this._struts.forEach(s => s.resetColor())
		this._highlighted = false
	}

	get numLeds(){
		let sum = 0
		this._struts.forEach(s => sum += s.numLeds)
		return sum
	}
	get ledPositions(){
		let positions = []
		for(let i = 0; i < this._struts.length; i++){
			let reversed = this._nodeList[i] > this._nodeList[i+1]
			positions.push(...this._struts[i].ledPositions)
		}
		return positions
	}
}

class Configurator {
	constructor(){
		this.currentController = 0
		this.options = []
		this.controllers = []
		this.controllerDropdown = gui.add(this, "currentController", this.options)
		this.addController()
		this.highlight(0)

		gui.add(this, "addController")
		this.controllerDropdown.onChange((id) => this.highlight(id))
	}

	addController(){
		let id = this.controllers.length
		this.controllers.push(new Controller(id))
		this.options.push(id)
		this.updateDropdown(this.options)
	}

	updateDropdown(list){   
	    let innerHTMLStr = "";
	    for(var i=0; i<list.length; i++){
	        var str = "<option value='" + list[i] + "'>" + list[i] + "</option>";
	        innerHTMLStr += str;        
	    }
	    if (innerHTMLStr != "") 
	    	this.controllerDropdown.domElement.firstChild.innerHTML = innerHTMLStr;
	}

	addNode(id){
		this.controllers[this.currentController].addNode(id)
	}

	highlight(id){
		console.log
		this.controllers.forEach(c => c.clearStrutColors())
		this.controllers[id].setStrutColors()
	}

	export(dome){
		let config = {
			Controllers: [],
			led_list: []
		}
		for(let i of this.options){
			let C = this.controllers[i]
			config.Controllers.push({
				id: i,
				num_leds: C.numLeds,
				start_index: config.led_list.length
			})
			console.log(C.ledPositions.length)
			config.led_list.push(...C.ledPositions)
		}
		return config
	}
}

// {
//     Controllers:[
//         { id: <id>, num_leds: <num>, start_index: <index>, [ip: <ip>] }
//         ...
//     ],
//     led_list: [[x,y,z],[x,y,z] ... list all 10.5k]
// }
