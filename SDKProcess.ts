import {
    CustomizedSDKArtBoard,
    HtmlArtBoards,
    HtmlArtBoardsAll, HtmlArtBoardsCustom,
    SDKArtBoard,
    SDKArtBoardWithContext,
    SDKPlugin,
    SDKRender,
    SDKTargetArtBoard
} from './DataDefs';
import path from "path";
import fs from "fs";
import {template} from "./SDKRenderUtils";

export  function processWithPlugins(artBoardWithContext:SDKArtBoardWithContext, plugins:SDKPlugin[], sdkRender:SDKRender):ReturnType<SDKRender> {
    return sdkRender(plugins.reduce((previousValue, plugin) => {
        return plugin(previousValue);
    },artBoardWithContext));
}

export function processCode(sourceDir:string, sdkArtBoards:SDKArtBoard[], plugins:SDKPlugin[], sdkRender:SDKRender,codeFileExt:string, contextFactory:(index:number,slug:string) => { [key:string]:any }) {
    return sdkArtBoards.map((sdkArtBoard, index) => {
            const sdkArtBoardWithContext: SDKArtBoardWithContext = {
                ...sdkArtBoard,
                context: contextFactory(index,sdkArtBoard.artBoard.slug), //context will be passed between plugins and render
            }
            const sdkTargetArtBoard = processWithPlugins(sdkArtBoardWithContext, plugins,sdkRender);
            const codeRelativeDir = "./CodeByAI/" + sdkArtBoard.codeType;
            const codeDir = path.resolve(sourceDir, codeRelativeDir);
            const codeFileName = sdkArtBoard.artBoard.slug + codeFileExt;
            fs.writeFileSync(path.resolve(codeDir, codeFileName), sdkTargetArtBoard.codes, {
                encoding: 'utf8'
            });
            sdkTargetArtBoard.codeFile = codeRelativeDir + "/" + codeFileName;
            if(sdkArtBoardWithContext.context.cssFileName && sdkTargetArtBoard.styles) {
                fs.writeFileSync(codeDir + "/" + sdkArtBoardWithContext.context.cssFileName, sdkTargetArtBoard.styles, {
                    encoding: 'utf8'
                });
            }
            return sdkTargetArtBoard;
    });
}


export function readArtBoards(sourceDir:string):CustomizedSDKArtBoard {
    const CUSTOMIZED_JSON = "CodeBYAI/customized.json";
    const jsonFile = path.resolve(sourceDir,CUSTOMIZED_JSON);
    if(!fs.existsSync(jsonFile)){
        throw `File not found:${jsonFile}`
    }
    const codeSDKArtBoard:CustomizedSDKArtBoard = JSON.parse(fs.readFileSync(jsonFile,{encoding:'utf8'}));
    return codeSDKArtBoard;
}

export function saveArtBoards(sourceDir:string, customCodes:HtmlArtBoardsCustom) {
    const bakFile = path.resolve(sourceDir,"bak","index.html");
    const htmlFile = path.resolve(sourceDir,"index.html");
    if(!fs.existsSync(bakFile)){
        throw `${bakFile} not found`
    }
    let htmlContent = fs.readFileSync(bakFile,{encoding:'utf8'});
    const generateArtBoardsOld:HtmlArtBoards = JSON.parse(fs.readFileSync(path.resolve(sourceDir,"CodeByAI/generate.json"),{encoding:'utf8'}));
    const generateArtBoards:HtmlArtBoardsAll = {
        ...generateArtBoardsOld,
        ...customCodes,
    };

    htmlContent = template(htmlContent,{
        codes:`codes=${JSON.stringify(generateArtBoards, undefined, 2)};`
    });
    fs.writeFileSync(htmlFile, htmlContent, {encoding:'utf8'});
}
