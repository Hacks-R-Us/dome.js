var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
var controls = new THREE.OrbitControls(camera)
var gui = new dat.GUI()
gui.add(controls, 'autoRotate')

// Initialize renderer
var renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio( window.devicePixelRatio )
document.body.appendChild(renderer.domElement)

// Initialize mouse raycasting
var cursorX, cursorY
var mouse = new THREE.Vector2()
var raycaster = new THREE.Raycaster()
document.onmousemove = function(e){
    mouse.x = ( e.clientX / renderer.domElement.clientWidth ) * 2 - 1
    mouse.y = -( e.clientY / renderer.domElement.clientHeight ) * 2 + 1
}

// Set up dome geometry
var dome = new Dome(2, 2.5, scene)
var pointsList = dome.vertices

// Add helper axes
var axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)
gui.add(axesHelper, 'visible').name('Show Axes')

// Set a default camera position
camera.position.set(3,2,3)

// Set up event handlers
document.onmousedown = function(e){
	if (dome.hover || dome.hover === 0)
    	Conf.addNode(dome.hover)
}

// Set up animation & per frame functions
function animate() {
	requestAnimationFrame(animate)
	controls.update()
	dome.update()
	render()
}

function render() {
	renderer.render(scene, camera)
}

// Do stuff
var Conf
$(function(){
	Conf = new Configurator()

	$(document).on("click",".controller", function (event) {
		let id = parseInt(event.target.id.slice(3))
		Conf.currentController = id
	});

	animate();
})
