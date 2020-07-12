#!/usr/bin/env node

import path from 'path';
import * as fs from 'fs';
import {
    CustomizedSDKArtBoard,
    HtmlArtBoardsCustom,
    SDKTargetArtBoard
} from './DataDefs';
import {processCode, readArtBoards, saveArtBoards} from './SDKProcess';
import SDKRenderReact from './SDKRenderReact';
import SDKRenderVue from "./SDKRenderVue";
import SDKRenderRN from "./SDKRenderRN";
import SDKRenderAndroid from "./SDKRenderAndroid";
import RNPluginButton from './plugins/rn/RNPluginButton';
import RNPluginSwitch from "./plugins/rn/RNPluginSwitch";
import RNPluginCheckbox from "./plugins/rn/RNPluginCheckbox";

//sourceDir or file in sourceDir, index.html etc.
let sourceDir = process.argv[2]
if(sourceDir && fs.existsSync(sourceDir) && fs.lstatSync(sourceDir).isFile()){
    sourceDir = path.dirname(sourceDir);
}

const codeSDKArtBoard:CustomizedSDKArtBoard = readArtBoards(sourceDir);
//todo replace RNPluginButton to your plugins
const rnSDKTargetArtBoards:SDKTargetArtBoard[] = processCode(sourceDir,codeSDKArtBoard.rn,[RNPluginButton,RNPluginSwitch,RNPluginCheckbox],SDKRenderRN,"-custom.js",(index)=>{
   return { scale: 14 }
});
const reactSDKTargetArtBoards:SDKTargetArtBoard[] = processCode(sourceDir,codeSDKArtBoard.react,[],SDKRenderReact,"-custom.js",(index)=>{
    return { cssFileName: `App-${index}-custom.css`, scale: 14 }
});
const vueSDKTargetArtBoards:SDKTargetArtBoard[] = processCode(sourceDir,codeSDKArtBoard.vue,[],SDKRenderVue,"-custom.vue",(index)=>{
    return { cssFileName: `App-${index}-custom.css`,scale: 14 }
});
const androidSDKTargetArtBoards:SDKTargetArtBoard[] = processCode(sourceDir,codeSDKArtBoard.android,[],SDKRenderAndroid,"-custom.xml",()=>{
    return {}
});

const generateArtBoards:HtmlArtBoardsCustom = {
    rnCustom:rnSDKTargetArtBoards,
    reactCustom:reactSDKTargetArtBoards,
    vueCustom:vueSDKTargetArtBoards,
    androidCustom:androidSDKTargetArtBoards,
};
saveArtBoards(sourceDir,generateArtBoards);

