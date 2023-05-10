
import {
    BlobReader,
    ZipReader,
    BlobWriter,
  } from "@zip.js/zip.js";

import * as THREE from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';


let defaultSkin = {};
let initializedDefault = false;
async function GetDefault(onProgress)
{
    if(initializedDefault)return defaultSkin;
    initializedDefault = true;
    onProgress({message: 'Loading Default Skin'});
    var response = await fetch("/default.zip");
    var data = await response.blob();
    defaultSkin = await LoadSkinFile(data, onProgress);
    return defaultSkin;
}

async function CreateSkinObject(onProgress)
{
    return {...await GetDefault(onProgress)}
}

async function LoadData(entry)
{
    return await entry.getData(new BlobWriter());
}

export async function LoadTexture(skin, name, onComplete, onProgress)
{
    const url = URL.createObjectURL(skin[name]);
    const loader = new DDSLoader();
    let resolve = null;
    let reject = null;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

    try {
        
        if(onProgress)onProgress({message: 'Loading Texture ' + name});
        loader.load(url, 
            tex => { 
                tex.name = name; 
                if(tex.mipmaps.length == 0) 
                    tex.mipmaps.push(tex.image); 
                if(onComplete) 
                    onComplete(tex); 
                tex.needsUpdate = true;
                resolve(tex);
            },
            xhr => {if(onProgress) onProgress({message: 'Loading Texture ' + name, progress: xhr.loaded / xhr.total})},
            err => {console.error(name, err); reject(err);},
        );
    } catch (error) {
        console.error(name, error);
        reject(error);
    }
    
    return promise;
}

export async function LoadSkinFile(data, onProgress)
{
    const zipFileReader = new BlobReader(data);

    const zipReader = new ZipReader(zipFileReader);
    let skin = await CreateSkinObject(onProgress);
    const entries = await zipReader.getEntries();

    onProgress({message: 'Loading Skin'});
    for(let i = 0; i < entries.length; i++)
    {
        const entry = entries[i];
        if(onProgress) onProgress({message: 'Extracting Skin', progress: i / entries.length});
        skin[entry.filename] = await LoadData(entry);
    }

    return skin;


}

