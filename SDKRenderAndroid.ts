import {HtmlViewNode, SDKArtBoardWithContext, SDKTargetArtBoard} from './DataDefs';
import {
    filterViewTree,
    getLines, renderNode2HtmlViewNode,
} from './SDKRenderUtils';

export default function SDKRender(artBoardWithContext:SDKArtBoardWithContext):SDKTargetArtBoard {
    const codeType = "android";
    const artBoard = artBoardWithContext.artBoard;
    const rootNode = artBoardWithContext.viewTree;
    const component = renderNode2HtmlViewNode(rootNode,0,codeType);
    let generatedComponent = `<?xml version="1.0" encoding="utf-8"?>\n`;
    let linesOffset = getLines(generatedComponent) + 1;
    function computeLine(node: HtmlViewNode, from: number) {
        const nodeLen = node.codeLine.end;
        node.codeLine.from+=from;
        node.codeLine.end+=from;
        if(node.children.length==0) return;
        const attributes = (node.children.reduce((previousValue, currentValue) => previousValue+currentValue.codeLine.end,0))
        from+=(nodeLen - attributes-1); //<View 加上属性行的高度
        for(let i=0; i<node.children.length; i++){
            computeLine(node.children[i], from);
            from = node.children[i].codeLine.end;
        }
    }
    computeLine(component, linesOffset);

    generatedComponent+=`${component.codes}\n`;
    delete  component.codes;

    const androidArtBoard: SDKTargetArtBoard =  {
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
        imagePath: "./CodeByAI/android/" + artBoard.slug +".png",
        styleLines: [],
        codes: generatedComponent,
        codeFile: './CodeByAI/android/' + artBoard.slug + ".xml",
    };
    return androidArtBoard;

}
