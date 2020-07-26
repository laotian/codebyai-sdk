import {RenderNode, HtmlViewNode, CODE_TYPE} from './DataDefs';
import path from "path";

function objectIsEqual(nodeA:{[key:string]:string}, nodeB:{[key:string]:string}) {
    const nodeAKeys = Object.keys(nodeA).sort();
    const nodeBKeys = Object.keys(nodeB).sort();
    if(nodeAKeys.length!=nodeBKeys.length){
        return false;
    }
    if(nodeAKeys.length==0 && nodeBKeys.length==0){
        return true;
    }
    return nodeAKeys.every((value, index) => {
        return nodeBKeys[index]==value && nodeA[value]==nodeB[value];
    });
}

function styleIsEqual(nodeA:RenderNode, nodeB:RenderNode) {
    if(!objectIsEqual(nodeA.styles, nodeB.styles)){
        return false;
    }
    if(nodeA.scopeStyles.length!=nodeB.scopeStyles.length){
        return false;
    }
    if(nodeA.scopeStyles.length==0 && nodeB.scopeStyles.length==0){
        return true;
    }
    return  nodeA.scopeStyles.forEach((scopeStyle,index)=>{
        const thatScopeStyle = nodeB.scopeStyles[index];
        return scopeStyle.scope == thatScopeStyle.scope
                && objectIsEqual(scopeStyle.styles,thatScopeStyle.styles);
    });
}

function getLines(str:String) {
    return str.split("\n").length - 1;
}


function renderSpace(padding:number) {
    let value = "";
    for(let i=0;i<padding;i++){
        value += " ";
    }
    return value;
}

function computeLine(node: HtmlViewNode, from: number) {
    node.codeLine = {
        from: node.codeLine.from + from,
        end: node.codeLine.end + from,
    };
    from++; //<View> for one line
    for(let i=0; i<node.children.length; i++){
        computeLine(node.children[i], from);
        from = node.children[i].codeLine.end;
    }
}

function formatStyleToCSS(className:string,scope:string, styles:{[key:string]:string|number}, indent:number):string {
    let currentStyle = "";
    if(!styles || Object.keys(styles).length==0){
        return currentStyle;
    }
    currentStyle += renderSpace(indent) + "." + className + scope + " {\n";
    currentStyle += Object.keys(styles).map(key=>{
        return `${renderSpace(indent+2)}${key}: ${styles[key]};\n`;
    }).join("");
    currentStyle += renderSpace(indent) + "}\n";
    return currentStyle;
}

function createCSS(renderNodeRoot:RenderNode):Map<string,string> {
    //style => className
    const styleMap:Map<string,string> = new Map<string, string>();
    const styleList:Array<RenderNode> = [];
    //repeat styles use the same className
    visitViewTree(renderNodeRoot,renderNode=>{
        const className = renderNode.name;
        const indent = 0;
        let cssName = '';
        const sameStyleNode = styleList.find(node=>styleIsEqual(node,renderNode));
        if(sameStyleNode){
            cssName = sameStyleNode.name;
        }else{
            let styleStr=formatStyleToCSS(className,'',renderNode.styles,indent);
            renderNode.scopeStyles.forEach(scopeStyle=>{
                styleStr+=formatStyleToCSS(className,scopeStyle.scope,scopeStyle.styles,indent);
            });
            if(styleStr.length>0){
                cssName = className;
                styleMap.set(styleStr, cssName);
                styleList.push(renderNode);
            }
        }
        if(cssName && !renderNode.className.includes(cssName)){
            renderNode.className.push(cssName);
        }
        return renderNode;
    });
    return styleMap;
}

/**
 * visit the whole viewTree
 * @param node viewTree root node
 * @param visitor
 */
export function visitViewTree<T extends {children:T[]}>(node: T, visitor: (node: T) => (T | undefined)) {
    const resultNode = visitor(node);
    if(resultNode){
        resultNode.children = resultNode.children.map(child=>visitViewTree(child, visitor)).filter(childNode => childNode);
    }
    return resultNode;
}

/**
 * filter from the viewTree whose root is node
 * @param node viewTree root node
 * @param satisfy condition, all as default
 */
function filterViewTree<T extends {children:T[]}>(node:T, satisfy:(node:T)=>boolean = ()=>true): T[] {
    const nodeList:T[] = [];
    visitViewTree(node, target => {
        if (satisfy(target)) {
            nodeList.push(target);
        }
        return target;
    });
    return nodeList;
}

function template(content:string, data:{[key:string]:string}) {
    var content = content.replace(new RegExp("\\<\\!\\-\\-\\s([^\\s\\-\\-\\>]+)\\s\\-\\-\\>", "gi"), function($0, $1) {
        if ($1 in data) {
            return data[$1];
        } else {
            return $0;
        }
    });
    return content;
}

function renderNode2HtmlViewNode(node:RenderNode, padding:number, codeType:CODE_TYPE): HtmlViewNode{
    const componentName = node.viewName;
    const space = renderSpace(padding);
    let jsx = space;
    jsx+=`<${componentName}`;
    if(node.className.length>0) {
        const className = node.className.join(" ");
        const classNameKey = codeType=="react" ? "className" : "class";
        jsx += ` ${classNameKey}='${className}'`
    }
    if(codeType=='android'){
        jsx+="\n";
    }
    let propPre = ' ';
    let propJoin = '';
    if(codeType=='android'){
        propPre =  renderSpace(padding+2);
        propJoin = "\n";
    }
    const props = node.props.map(p=>{
        let content = `${propPre}${p.name}`;
        if(p.expression){
            content+=`={${p.value}}`;
        }else if(p.value!=undefined){
            content += `='${p.value}'`
        }
        return content;
    }).join(propJoin);
    if(props){
        jsx+= props;
    }

    let childContent = "";
    let childs = [];
    let childNewLine = true;
    //文本
    if(node.content){
        childNewLine = false;
        childContent = node.content;
    }else{
        childs = node.children.map(child=>renderNode2HtmlViewNode(child, padding+2, codeType));
        childContent = childs.map(child=>child.codes).join("");
        //去掉child.codes
        childs.forEach(child=>delete child.codes);
    }
    if(childContent.length==0){
        jsx += " />\n";
    }else {
        if(childNewLine) {
            jsx += `>\n${childContent}${space}</${componentName}>\n`;
        }else{
            jsx += `>${childContent}</${componentName}>\n`
        }
    }

    let viewNode:HtmlViewNode = {
        id: node.id,
        name: node.name,
        codes: jsx,
        rect:{
            x: node.layout.left,
            y: node.layout.top,
            width: node.layout.right - node.layout.left,
            height: node.layout.bottom - node.layout.top,
        },
        children: childs,
        codeLine:{
            from: 0,
            end: getLines(jsx),
        },
        componentName:node.componentName,
    };
    if(node.asset && node.asset.length==1 && node.asset[0].path){
        const slice = node.asset[0].targetPath;
        viewNode.exportable = [{
            name: path.basename(slice, ".png"),
            format: "png",
            path:  codeType=="android" ? `./CodeByAI/${codeType}/${slice}` : `./CodeByAI/${codeType}/images/${slice}`,
        }];
    }
    return viewNode;
}


export {
    styleIsEqual,
    formatStyleToCSS,
    createCSS,
    computeLine,
    getLines,
    renderSpace,
    filterViewTree,
    template,
    renderNode2HtmlViewNode,
}
