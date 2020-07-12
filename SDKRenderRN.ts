import {RenderNode, SDKArtBoardWithContext, SDKTargetArtBoard, StyleCodeLine} from './DataDefs';
import {
    computeLine,
    filterViewTree,
    getLines, renderNode2HtmlViewNode,
    renderSpace, styleIsEqual, visitViewTree
} from './SDKRenderUtils';


/**
 *
 * @param artBoardWithContext 其中的context，需包含{{
	inlineStyleCount,属性内联最大数限制,默认3
}}
 */
export default function SDKRender(artBoardWithContext:SDKArtBoardWithContext):SDKTargetArtBoard {
    //生成
    artBoardWithContext.context = Object.assign({},{
        inlineStyleCount:3,
        scale:2,
    },artBoardWithContext.context);

    const componentNames: string[] = ["View","Text","Image","ImageBackground","TextInput","StyleSheet","TouchableWithoutFeedback","TouchableHighlight"];
    const artBoard = artBoardWithContext.artBoard;

    let styleLineArray = new Array<StyleCodeLine>();
    const rootNode = artBoardWithContext.viewTree;

    const inlineStyleCount = artBoardWithContext.context.inlineStyleCount;
    const scale = artBoardWithContext.context.scale;

    //style => className
    const cssMap:Map<string,string> = new Map<string, string>();
    const styleList:Array<RenderNode> = [];
    //重复style处理
    visitViewTree(rootNode,node=>{
        const className = node.name;
        const indent = 2;
        let cssName = '';
        const styleLen = Object.keys(node.styles).length;
        //remove style from props
        const styleInPropsIndex = node.props.findIndex(element=>{
           return  element.name=="style";
        })
        if(styleInPropsIndex>=0){
            node.props.splice(styleInPropsIndex,1);
        }
        if(styleLen>inlineStyleCount){
            const sameStyleNode = styleList.find(n=>styleIsEqual(node,n));
            if(sameStyleNode){
                cssName = sameStyleNode.name;
            }else{
                cssName = className;
                let styleStr = "";
                styleStr+=renderSpace(indent) + cssName + ": {\n";
                styleStr+=Object.keys(node.styles).map(styleKey=>{
                    return `${renderSpace(indent+2)}${styleKey}: ${node.styles[styleKey]}`;
                }).join(",\n");
                styleStr+=`\n${renderSpace(indent)}},\n`;
                cssMap.set(styleStr, cssName);
                styleList.push(node);
            }
            node.props.push({
                name:"style",
                value:`styles.${cssName}`,
                expression:true
            })
        }else if(styleLen>0){
            const styles = Object.keys(node.styles).map(styleKey=>{
                return  `${styleKey}: ${node.styles[styleKey]}`;
            }).filter(style=>style).join(", ");
            node.props.push({
                name:"style",
                value:`{ ${styles} }`,
                expression:true
            })
        }
        return node;
    });

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
    }).map(node=>{
        let targetSrc = node.asset[0].targetPath;
        if(scale>1 && targetSrc.endsWith("@2x.png")){
            targetSrc = targetSrc.replace("@2x.png",".png");
        }
        return `import ${node.asset[0].importName} from './images/${targetSrc}'`;
    }).join("\n");

    const component = renderNode2HtmlViewNode(rootNode,6,"rn");
    let generatedComponent = `import React, { Component } from 'react';
import { ${componentNames.join(", ")} } from 'react-native';
${importImages}

export default class App extends Component {
  render() {
    return (\n`;

    let linesOffset = getLines(generatedComponent) + 1;
    computeLine(component, linesOffset);

    generatedComponent+=`${component.codes}
    )
  }
}\n`;
    linesOffset = getLines(generatedComponent) + 1;
    styleLineArray.forEach(style=>{
        style.from+=linesOffset;
        style.end+=linesOffset;
    });
    generatedComponent += "const styles = StyleSheet.create({\n" + styles +"});\n";
    delete  component.codes;
    const rnArtBoard: SDKTargetArtBoard =  {
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
        imagePath: "./CodeByAI/rn/" + artBoard.slug +".png",
        styleLines: styleLineArray,
        codes: generatedComponent,
        codeFile:  './CodeByAI/rn/' + artBoard.slug + ".js",
    };
    return rnArtBoard;
}
