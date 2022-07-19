import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";




console.log(gsap);

const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};

gui.add(world.plane, "width", 1, 500).onChange(generatePlane);

gui.add(world.plane, "height", 1, 500).onChange(generatePlane);

gui.add(world.plane, "widthSegments", 1, 100).onChange(generatePlane);

gui.add(world.plane, "heightSegments", 1, 100).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  // Vertice position randomization
const { array } = planeMesh.geometry.attributes.position;

const randomValues=[];

for (let i = 0; i < array.length; i++) {

  if(i%3===0){
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
  
    array[i] = x + (Math.random()-0.5)*3;
    array[i + 1] = y + (Math.random()-0.5)*3;
    array[i + 2] = z + (Math.random()-0.5)*3;
  }
 
  randomValues.push(Math.random()*Math.PI*2);
}

// Making a reference array to randomize vertices
planeMesh.geometry.attributes.position.originalPosition=planeMesh.geometry.attributes.position.array;

planeMesh.geometry.attributes.position.randomValues=randomValues;


  // Also adding the color to vertices here
  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0.2, 0.1, 0.5);
  }

  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

//importing the raycaster here
const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

camera.position.z = 50;

const planeGeometry = new THREE.PlaneGeometry(world.plane.width,world.plane.height, world.plane.widthSegments, world.plane.heightSegments);

const planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xff0000,we donot need it becus it will interfere with vertext color
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true, //import for hover color change
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
console.log(planeMesh.geometry.attributes.position.array);

generatePlane();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

// For the starfield we will be adding a points object
// Points object is like a mesh but the vertices donot connect to each other. We will be creating points and light up those points to make the galaxy
const starGeometry = new THREE.BufferGeometry();
const startMaterial = new THREE.PointsMaterial({
  color:0xffffff
});

const starVerticies=[];
for(let i=0;i<10000;i++){
  const x= (Math.random()-0.5) * 2000;
  const y= (Math.random()-0.5) * 2000;
  const z= (Math.random()-0.5) * 2000;
  starVerticies.push(x,y,z);
}


starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVerticies,3));

const stars =new THREE.Points(starGeometry,startMaterial);

scene.add(stars);




const mouse = {
  x: undefined,
  y: undefined,
};


let frame=0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  frame+=0.01;
  const {array,originalPosition,randomValues}=planeMesh.geometry.attributes.position;

  for(let i=0;i<array.length;i+=3){
    // x
    array[i]=originalPosition[i] + Math.cos(frame + randomValues[i] )*0.01;
    // y
    array[i+1]=originalPosition[i+1] + Math.sin(frame + randomValues[i+1] )*0.001;
  }

  planeMesh.geometry.attributes.position.needsUpdate=true;



  //checking if raycaster intersecting with the plane
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;

    // Vertices 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    // Vertices 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    // Vertices 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    // Using gsap to animate back to the color
    const initialColor = {
      r: 0.2,
      g: 0.1,
      b: 0.5,
    };
    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        // Vertices 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        // Vertices 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        // Vertices 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });
  }

  stars.rotation.x+=0.0005;
}

animate();

addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});

// Now we will be using gsap for the animation (fade out)
// npm install gsap --save

// Animate the texts
gsap.to('h1',{
  opacity:1,
  duration:1.5,
  y:0,
  ease: 'expo.in'
})
gsap.to('p',{
  opacity:1,
  duration:1.5,
  delay:0.3,
  y:0,
  ease: 'expo.in'
})
gsap.to('button',{
  opacity:1,
  duration:1.5,
  delay:0.6,
  y:0,
  ease: 'expo.in'
})


// the moving in page animation

document.querySelector('button').addEventListener('click',(e)=>{
  console.log('go');
  gsap.to('#container',{
    opacity:0
  })

  // sound
  const au=new Audio('/sounds/3.mp3');
  au.play();


  gsap.to(camera.position,{
    z:25,
    ease:'power3.inOut',
    duration:12
  })
  gsap.to(camera.rotation,{
    x:1.57,
    ease:'power3.inOut',
    duration:12
  })
  gsap.to(camera.position,{
    y:1000,
    ease:'power3.in',
    duration:5,
    delay:12,
    // onComplete:()=>{
    //   window.location='link here'
    // }
    onComplete:()=>{
      const ai=new Audio('/sounds/3.mp3');
      ai.play();
      gsap.to(camera.rotation,{
        y:3.14,
        ease:'power3.inOut',
        duration:5,
      })
      gsap.to(camera.position,{
        y:0,
        ease:'power3.inOut',
        duration:12,
        delay:5,
        onComplete:()=>{
          gsap.to(camera.rotation,{
            y:0,
            ease:'power3.inOut',
            duration:2,
            onComplete:()=>{
              gsap.to(camera.rotation,{
                x:0,
                ease:'power3.inOut',
                duration:2,
                onComplete:()=>{
                  gsap.to(camera.position,{
                    z:50,
                    ease:'power3.inOut',
                    duration:2,
                    onComplete:()=>{
                      gsap.to('#container',{
                        opacity:1
                      })
                      
                    }
                  })
                }
              })
            }
          })
          
        }
      })
    }
  })
});

// Adding the auto resize on screen size change

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
})


// adding sounds
const audio=new Audio('/sounds/1.mp3');
audio.play();
