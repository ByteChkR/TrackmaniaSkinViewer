<script>
    import * as THREE from 'three';
    import { browser } from '$app/environment';
    import { createEventDispatcher } from 'svelte';

    export let camera;
    export let initialize = true;
    
    export const control = {
        start: () => { render = true; Render();},
        stop: () => { render = false; },
        resize: () => { if(container) Resize(); },
        getRenderer: () => { return renderer; },
        getCamera: () => { return camera; },
        getScene: () => { return scene; }
    }

    const dispatch = createEventDispatcher();

    let initialized = false;
    let render = false;
    let scene;
    let container;
    let renderer;

    function Render()
    {
        if(!render) return; 
        requestAnimationFrame( Render );
        dispatch('render', control);
	    renderer.render( scene, camera );
    }

    let lastWidth = 0;
    let lastHeight = 0;
    function Resize()
    {
        if(lastWidth == container.clientWidth && lastHeight == container.clientHeight) return;
        renderer.setSize( container.clientWidth, container.clientHeight );
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        lastWidth = container.clientWidth;
        lastHeight = container.clientHeight;
    }

    function Initialize()
    {
        console.log(container);

        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({antialias: true});
        container.appendChild( renderer.domElement );

        if(!camera)
        {
            camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000000 )
        }
        
        
        Resize();
        
        dispatch('initialized', control);
    }


    $: if(!initialized && browser && container && initialize)
    {
        initialized = true;
        Initialize();
    }
    
</script>

<div style="width: 100%; height: 100%; margin: 0; padding: 0;" bind:this={container}>
</div>