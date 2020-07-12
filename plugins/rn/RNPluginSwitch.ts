import {RenderNode, SDKPlugin} from '../../DataDefs';
import {filterViewTree, visitViewTree} from '../../SDKRenderUtils';


function replace(node:RenderNode,value:string) {
    node.viewName = "CSwitch";
    node.props.push({
        name:'value',
        value,
    });
    node.props.push({
        name:'onValueChange',
        value: `(value) => {}`,
        expression:true,
    });
    node.children = [];
    return node;
}


/**
 * 自定义按钮替换演示插件
 */
const RNPluginSwitch: SDKPlugin =  (artBoardWithContext) => {
    //自上至下递归处理VIEW结点
    artBoardWithContext.viewTree = visitViewTree(artBoardWithContext.viewTree,node => {
        //View对应sketch symbol '按钮/标准按钮/正常态btn_blue_a'
        if(node.symbol?.type=="元素/选择/开"){
            return replace(node,"1");
        }

        if(node.symbol?.type=="元素/选择/关"){
            return replace(node,"0");
        }
        return node;
    });
    return artBoardWithContext;
}

export default RNPluginSwitch;
