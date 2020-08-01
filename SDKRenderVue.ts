import { SDKArtBoardWithContext, SDKTargetArtBoard, HtmlViewNode, StyleCodeLine} from './DataDefs';
import {computeLine, createCSS, filterViewTree, getLines,renderNode2HtmlViewNode} from './SDKRenderUtils';

/**
 *
 * @param artBoardWithContext 其中的context，需包含{{
	scale
}}
 */
export default function SDKRender(artBoardWithContext:SDKArtBoardWithContext):SDKTargetArtBoard {
    const codeType = "vue";
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

    const component = renderNode2HtmlViewNode(rootNode,4,codeType);
    let generatedComponent = `<template>\n`;
    let linesOffset = getLines(generatedComponent) + 1;
    computeLine(component, linesOffset);
    generatedComponent+=`${component.codes}</template>

<script>
// Manually set the base font size: ${renderConfig.scale}px for rem
// html{font-size: ${renderConfig.scale}px}
export default {
    name: "App",
}
</script>
`;
    generatedComponent += `
<style scoped>
${styles}
</style>
`;
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
        imagePath: "./CodeByAI/vue/" + artBoard.slug +".png",
        styleLines: styleLineArray,
        codes: generatedComponent,
        styles,
        codeFile:  './CodeByAI/vue/' + artBoard.slug + ".vue",
    };
    return targetArtBoard;
}
