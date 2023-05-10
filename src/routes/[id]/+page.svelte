<script>
	import SkinRenderer from '$lib/SkinRenderer.svelte';
	import LoadingScreen from '$lib/LoadingScreen.svelte';
    /** @type {import('./$types').PageData} */
    export let data;

    let loading = true;

    let setLoadingProgress;

    function OnProgress(progress)
    {
        loading = true;
        if(setLoadingProgress)
        {
            setLoadingProgress(progress);
        }
    }

    function GetUrl()
    {
        if(data.id)
        {
            return `/storageObjects/${data.id}`;
        }
        return "/default.zip";
    }

</script>
<div class="fullscreen" style="background-color: black;">
    {#if loading}
        <LoadingScreen bind:setLoadingProgress={setLoadingProgress}></LoadingScreen>
    {/if}
    <SkinRenderer on:loaded={() => loading = false} on:progress={e => OnProgress(e.detail)} url={GetUrl()}></SkinRenderer>
</div>

<style>
    .fullscreen{
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
</style>