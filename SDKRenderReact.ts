import {SDKArtBoardWithContext, SDKTargetArtBoard, StyleCodeLine} from './DataDefs';
import {computeLine, createCSS, filterViewTree, getLines, renderNode2HtmlViewNode} from './SDKRenderUtils';


/**
 *
 * @param artBoardWithContext 其中的context，需包含{{
	cssFileName
	scale
}}
 */
export default function SDKRender(artBoardWithContext:SDKArtBoardWithContext):SDKTargetArtBoard {
    const codeType = "react";
    const renderConfig = artBoardWithContext.context;
    const artBoard = artBoardWithContext.artBoard;
    const rootNode = artBoardWithContext.viewTree;
    const styleLineArray = new Array<StyleCodeLine>();
    const cssMap = createCSS(rootNode);
    let styleLineFrom = 1;
    let styles = "";
    cssMap.forEach((cssName, cssLines) => {
        const len = getLines(cssLines);
        styleLineArray.push({
            id:cssName,
            from:styleLineFrom,
            end:styleLineFrom+len,
        });
        styleLineFrom+=len;
        styles+=cssLines;
    });

    const component = renderNode2HtmlViewNode(rootNode,8,codeType);
    const hasImported:string[] = [];
    const importImages = filterViewTree(rootNode,node=>{
        if(node.asset && node.asset.length==1){
            const importName = node.asset[0].importName;
            if(importName && !hasImported.includes(importName)){
                hasImported.push(importName);
                return true;
            }
        }
        return false;
    }).map(node=>`import ${node.asset[0].importName} from './images/${node.asset[0].targetPath}'`).join("\n");
    // componentNames.push("StyleSheet");
    let generatedComponent = `import React, { Component } from 'react';
import './codeByAI.css';
import './${renderConfig.cssFileName}';
${importImages}

// Manually set the base font size: ${renderConfig.scale}px for rem
// html{font-size: ${renderConfig.scale}px}

export default class App extends Component {
  render() {
    return (\n`;

    let linesOffset = getLines(generatedComponent) + 1;
    computeLine(component, linesOffset);
    generatedComponent+=`${component.codes}
    )
  }
}\n`;
    delete  component.codes;
    const targetArtBoard: SDKTargetArtBoard =  {
        pageName:artBoard.pageName,
        pageObjectID:artBoard.pageObjectID,
        name: artBoard.name,
        slug: artBoard.slug,
        objectID: artBoard.objectID,
        width: artBoard.width,
        height: artBoard.height,
        layers: filterViewTree(component, node => true).map(layer=>{
            delete layer.children;
            return layer;
        }),
        imagePath: "./CodeByAI/react/" + artBoard.slug +".png",
        styleLines: styleLineArray,
        codes: generatedComponent,
        styles,
        codeFile:  './CodeByAI/react/' + artBoard.slug + ".js",
    };
    targetArtBoard.layers.forEach(layer=>{
        delete layer.children;
    });
    return targetArtBoard;
}
