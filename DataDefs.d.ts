
type Asset = Partial<{
    path:string,
    targetPath:string,
    importName:string,
    content:string,
}> ;

/**
 * ViewTree
 */
export interface RenderNode {
    //view name, EditText/ImageView/div etc.
    viewName:string,
    //View Props, android:text/onPress etc.
    props:{
        name:string,
        value?:string,
        //RN value type is expression {} or common string?
        expression?:boolean,
    }[],
    //RN/REACT/VUE view class names.
    className:string[],
    //text content
    content?:string,
    //RN/REACT/VUE styles, color/marginTop etc.
    styles:{
        [key:string]:string;
    },
    //REACT/VUE css selector, ::-webkit-input-placeholder / :active
    scopeStyles:{
        scope:string,
        styles:{
            [key:string]:string;
        }
    }[],
    children:RenderNode[],
    //UDID,for debug only, not android:id
    id:string,
    //sketch layer formatted name, to be style name.
    name:string,
    //sketch layer absolute position
    layout: {
        left:number;
        top:number;
        right:number;
        bottom:number;
    },
    //sketch symbol, to be replaced by company component
    symbol?:{
        //layer name in the symbol
        name:string,
        //sketch symbol type name,
        type:string;
    },
    //code notes, preserved only
    notes?:string,
    asset?: Asset[],
}

export interface CodeLine {
    from: number;
    end: number;
}

export interface StyleCodeLine extends CodeLine{
    id: string;
}

export interface HtmlViewNode{
    id: string;
    styleId?: string;
    codeLine: CodeLine,
    children: HtmlViewNode[];
    codes: string;
    rect: {
        x:number,
        y:number,
        width:number,
        height:number;
    };
    exportable?: [
        {
            "name": string,
            "format": "png",
            "path": string
        }
    ]
    name?: string;
}

export interface BaseArtBoard {
    pageName:string;
    pageObjectID:string;
    name: string;
    slug?: string;
    objectID: string;
    width: number;
    height: number;
    imagePath?: string;
}

export interface SDKTargetArtBoard extends BaseArtBoard{
    layers: HtmlViewNode[],
    styleLines: CodeLine[],
    styles?: string,
    codes: string,
    codeFile: string;
}

export type HtmlArtBoards = {
    android:SDKTargetArtBoard[],
    rn:SDKTargetArtBoard[],
    react:SDKTargetArtBoard[],
    vue:SDKTargetArtBoard[],
}

export type HtmlArtBoardsCustom = {
    androidCustom?:SDKTargetArtBoard[],
    rnCustom?:SDKTargetArtBoard[],
    reactCustom?:SDKTargetArtBoard[],
    vueCustom?:SDKTargetArtBoard[],
}

export type HtmlArtBoardsAll = HtmlArtBoards & HtmlArtBoardsCustom;

export type CODE_TYPE = 'rn' | 'react' | 'vue' | 'android';

export type CustomizedSDKArtBoard = {
    rn:SDKArtBoard[],
    react:SDKArtBoard[],
    vue:SDKArtBoard[],
    android:SDKArtBoard[]
}

export interface SDKArtBoard{
    artBoard: BaseArtBoard,
    viewTree: RenderNode;
    codeType: CODE_TYPE,
}

export interface SDKArtBoardWithContext extends SDKArtBoard{
    context:{
        [key:string]:any
    }
}

export type SDKRender = (artBoardWithContext:SDKArtBoardWithContext)=>SDKTargetArtBoard;

export type SDKPlugin = (artBoardWithContext:SDKArtBoardWithContext)=>SDKArtBoardWithContext;
