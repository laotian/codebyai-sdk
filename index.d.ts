
import {
    CODE_TYPE, CustomizedSDKArtBoard,
    HtmlArtBoardsCustom, HtmlViewNode,
    RenderNode,
    SDKArtBoard,
    SDKArtBoardWithContext,
    SDKPlugin,
    SDKRender
} from "./DataDefs";

export namespace SDKProcess {
    function processWithPlugins(artBoardWithContext: SDKArtBoardWithContext, plugins: SDKPlugin[], sdkRender: SDKRender): ReturnType<SDKRender>;

    function processCode(sourceDir: string, sdkArtBoards: SDKArtBoard[], plugins: SDKPlugin[], sdkRender: SDKRender, codeFileExt: string, contextFactory: (index: number, slug: string) => { [key: string]: any });

    function readArtBoards(sourceDir:string):CustomizedSDKArtBoard;

    function saveArtBoards(sourceDir: string, customCodes: HtmlArtBoardsCustom);
}

export namespace Render{
    const SDKRenderRN: SDKRender;
    const SDKRenderReact: SDKRender;
    const SDKRenderVue: SDKRender;
    const SDKRenderAndroid: SDKRender;
}

export namespace Utils {
    function styleIsEqual(nodeA: RenderNode, nodeB: RenderNode): boolean;

    function formatStyleToCSS(className: string, scope: string, styles: { [key: string]: string | number }, indent: number): string;

    function createCSS(renderNodeRoot: RenderNode): Map<string, string>;

    function computeLine(node: HtmlViewNode, from: number): void;

    function renderNode2HtmlViewNode(node: RenderNode, padding: number, codeType: CODE_TYPE): HtmlViewNode;

    function visitViewTree<T extends { children: T[] }>(node: T, visitor: (node: T) => (T | undefined));

    function filterViewTree<T extends { children: T[] }>(node: T, satisfy: (node: T) => boolean): T[];

    function template(content:string, data:{[key:string]:string});

    function renderSpace(padding:number):string;
}




