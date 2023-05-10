<script>
    import { fade } from "svelte/transition";
    export let historyCount = 3;
    let progressHistory = ["", "", ""];
    let refresh = {};
    let progressBar;

    export const setLoadingProgress = (progress) => {
        //Add to progress history if the message property differs from the last message
        if(progressHistory.length == 0 || progressHistory[0] != progress.message)
        {
            progressHistory.unshift(progress.message);
            //Remove old messages
            if(progressHistory.length > historyCount)
            {
                progressHistory.pop();
            }
        }
        progressBar.style.width = `${progress.progress * 100}%`;
        refresh = {};
    }


    $: if(progressHistory.length < historyCount)
    {
        progressHistory = progressHistory.concat(Array(historyCount - progressHistory.length).fill(""));
    }
</script>

<div out:fade style="background-color: black; width: 100vw; height: 100vh; overflow: hidden; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <div class="wrapper">
        <div class="progress-bar">
            <span bind:this={progressBar} class="progress-bar-fill"></span>
        </div>
    </div>
    {#key refresh}
        {#each progressHistory as message, i}
            <p style="color: white; opacity: {1 - (i / historyCount)}">{message}</p>
        {/each}
    {/key}
</div>

<style>
    .wrapper {
        width: 500px;
    }
    
    .progress-bar {
        width: 100%;
        background-color: #e0e0e0;
        padding: 3px;
        border-radius: 3px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);
    }
    
    .progress-bar-fill {
        display: block;
        height: 22px;
        background-color: #659cef;
        border-radius: 3px;
    }
</style>