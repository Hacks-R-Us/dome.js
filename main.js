var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var controls = new THREE.OrbitControls(camera);
var gui = new dat.GUI();
gui.add(controls, 'autoRotate');

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ledcount = 10520;

// Prepare the dome shader
var uniforms = {
	texture:   { value: new THREE.TextureLoader().load( "spark1.png" ) }
};

var colours = [];

for (var i = 0; i < ledcount; i++) {
	colours.push(1.0, 1.0, 1.0)
}

var vertShader = `\
varying vec3 vColor;
void main() {
	vColor = color;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = 0.05 * ( 300.0 / -mvPosition.z );
	gl_Position = projectionMatrix * mvPosition;
}`

var fragShader = `\
uniform sampler2D texture;
varying vec3 vColor;
void main() {
	gl_FragColor = vec4( vColor, 1.0 );
	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
}`

var ledsmaterial = new THREE.ShaderMaterial( {
	uniforms:       uniforms,
	vertexShader:   vertShader,
	fragmentShader: fragShader,
	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true,
	vertexColors:   true
});

var led_particle_geo = new THREE.BufferGeometry();
led_particle_geo.addAttribute('color', new THREE.Float32BufferAttribute(colours, 3).setDynamic(true));

// Load the LED geometry
var loader = new THREE.FileLoader();
loader.load(
	'dome.config',

	// onLoad callback
	function ( data ) {
		var leds = JSON.parse(data).led_list;

		var leds_destructured = leds.reduce((wip, led) => wip.concat(led));

		led_particle_geo.addAttribute('position', new THREE.Float32BufferAttribute(leds_destructured, 3));

		var ledparticles = new THREE.Points(led_particle_geo, ledsmaterial);

		scene.add(ledparticles);
	},
);

var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

gui.add(axesHelper, 'visible').name('Show Axes');

camera.position.x = 5;
// camera.position.y = 3;

animate();

function animate() {
	requestAnimationFrame( animate );
    controls.update();
	render();
}

var event_data = new EventSource("/sub");
var dome_data = "";
var receiving_domeage = false;

event_data.onmessage = function (event) {
	receiving_domeage = true;
	dome_data = event.data;
};

function handleDomeData() {
	// Handle an incoming packet of base64-encoded domey goodness
	if (!receiving_domeage) {
		return;
	}
	var dome_binary = atob(dome_data);

	var colours = led_particle_geo.attributes.color.array;

	for ( var i = 0; i < ledcount * 3; i++ ) {
		colours[i] = dome_binary.charCodeAt(i) / 255;
	}
	led_particle_geo.attributes.color.needsUpdate = true;
}


function render() {
	handleDomeData();
	renderer.render( scene, camera );
}
