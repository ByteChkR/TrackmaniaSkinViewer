<script>
    import Renderer from "./Renderer.svelte";
    import * as THREE from 'three';
    import { LoadSkinFile, LoadTexture } from './SkinLoader.js';
    import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import {define, uniforms, emission, normals} from "./Shader.js"
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let url;

    let model = null;
    async function CreateScene(control)
    {
        
        const scene = control.getScene();
        const camera = control.getCamera();
        const renderer = control.getRenderer();
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.target.set(0, 1, 0)

        camera.position.z = 5;
        camera.position.y = 1;

        const dirLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
        dirLight.position.set( 0, 200, 100 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 180;
        dirLight.shadow.camera.bottom = - 100;
        dirLight.shadow.camera.left = - 120;
        dirLight.shadow.camera.right = 120;
        scene.add( dirLight );

        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );

        const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add( grid );

        
        
        LoadModel(control);
        return scene;
    }
    let scene;

    function Animate(control)
    {
        if(!model) return;
        control.resize();
    }

    function FlipTexture(tex)
    {
        tex.repeat.y = -1;
        tex.offset.y = 1;
    }

    async function SetDetailsMaterial(material, skin)
    {
        material.aoMap = await LoadTexture(skin, "Details_AO.dds",FlipTexture, msg => dispatch("progress", msg));
        material.map = await LoadTexture(skin, "Details_B.dds",FlipTexture, msg => dispatch("progress", msg));
        material.normalMap = await LoadTexture(skin, "Details_N.dds", undefined, msg => dispatch("progress", msg));
        material.emissiveMap = await LoadTexture(skin, "Details_I.dds",FlipTexture, msg => dispatch("progress", msg));
        material.roughnessMap = await LoadTexture(skin, "Details_R.dds",FlipTexture, msg => dispatch("progress", msg));
    }

    async function SetSkinMaterial(material, skin)
    {
        material.aoMap = await LoadTexture(skin, "Skin_AO.dds", FlipTexture, msg => dispatch("progress", msg));
        material.map = await LoadTexture(skin, "Skin_B.dds", FlipTexture, msg => dispatch("progress", msg));
        material.emissiveMap = await LoadTexture(skin, "Skin_I.dds", FlipTexture, msg => dispatch("progress", msg));
        material.roughnessMap = await LoadTexture(skin, "Skin_R.dds", FlipTexture, msg => dispatch("progress", msg));
    }

    async function SetWheelMaterial(material, skin)
    {
        material.aoMap = await LoadTexture(skin, "Wheels_AO.dds", FlipTexture, msg => dispatch("progress", msg));
        material.map = await LoadTexture(skin, "Wheels_B.dds", FlipTexture, msg => dispatch("progress", msg));
        material.normalMap = await LoadTexture(skin, "Wheels_N.dds", undefined, msg => dispatch("progress", msg));
        material.roughnessMap = await LoadTexture(skin, "Wheels_R.dds", FlipTexture, msg => dispatch("progress", msg));
    }

    async function SetGlassMaterial(material, skin)
    {
        material.transparent = true;
        material.opacity = 0.5;
        material.color.r = material.color.g = material.color.b = 0;
        material.aoMap = await LoadTexture(skin, "Glass_AO.dds", FlipTexture, msg => dispatch("progress", msg));
        material.map = await LoadTexture(skin, "Glass_D.dds", FlipTexture, msg => dispatch("progress", msg));
        material.emissiveMap = await LoadTexture(skin, "Glass_I.dds", FlipTexture, msg => dispatch("progress", msg));
        material.needsUpdate = true;
    }

    async function LoadSkin(control, object)
    {
        const scene = control.getScene();
        dispatch("progress", {message: "Loading Skin from " + url});
        const response = await fetch(url);
        console.log(response);
        const data = await response.blob() 

        var skin = await LoadSkinFile(data, msg => dispatch("progress", msg));
        console.log(skin);
        var tasks = [];
        object.traverse( async function ( child ) {
            if ( child.isMesh )
            {
                console.log(child.name, child.material);
                if(child.name == "Details_01")
                {
                    tasks.push(SetDetailsMaterial(child.material, skin));
                }
                else if(child.name == "Skin_01")
                {
                    tasks.push(  SetSkinMaterial(child.material, skin));
                }
                else if(child.name == "Wheels_01")
                {
                    tasks.push( SetWheelMaterial(child.material, skin));
                }
                else if(child.name == "Glass_01")
                {
                    tasks.push( SetGlassMaterial(child.material, skin));
                }
            }
        } );

        await Promise.all(tasks);

        
        scene.add( object );

        dispatch("loaded");
        control.start();

    }

    function CreateMaterial()
    {
        let material = new THREE.MeshPhysicalMaterial();
        material.defines.USE_EMISSIVEMAP = '';
	    material.onBeforeCompile = shader => {
            shader.vertexShader = define + shader.vertexShader;
            shader.fragmentShader = uniforms + shader.fragmentShader;
            shader.fragmentShader = //this is the fragment program string in the template format 
                shader.fragmentShader
                    .replace( //we have to transform the string
                        '#include <emissivemap_fragment>', //we will swap out this chunk
                        emission)
                    .replace(
                        '#include <normal_fragment_maps>', 
                        normals);
        }


        material.needsUpdate = true;
        return material;
    }

    function LoadModel(control)
    {
        const scene = control.getScene();
        const fbxLoader = new FBXLoader()
        
        dispatch("progress", {message: "Loading Car Model"});
        fbxLoader.load(
            'car.fbx',
            async (object) => {

                object.traverse( function ( child ) {
                    if ( child.isMesh ) {

                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = CreateMaterial();
                    }
                } );

                object.scale.set(0.01, 0.01, 0.01);

                await LoadSkin(control, object);
                model = object;
            },
            xhr => dispatch("progress", {message: "Loading Car Model", progress: xhr.loaded / xhr.total}),
            ( error ) => console.log( error )
        )
    }

    let control;


    dispatch("progress", {message: "Initializing Renderer"});

    function Initialize(control)
    {
        scene = CreateScene(control);
    }
</script>

<Renderer 
    {scene} 
    bind:control={control} 
    on:initialized={e => Initialize(e.detail)}
    on:render={e => Animate(e.detail)}>
</Renderer>
