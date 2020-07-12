import {RenderNode, SDKPlugin} from '../../DataDefs';
import {filterViewTree, visitViewTree} from '../../SDKRenderUtils';


function replace(node:RenderNode,value:string) {
    node.viewName = "CCheckBox";
    if(value){
        node.props.push({
            name:'checked',
            value:undefined,
        });
    }
    node.props.push({
        name:'onChange',
        value: `(value) => {}`,
        expression:true,
    });
    node.children = [];
    return node;
}


/**
 * 自定义按钮替换演示插件
 */
const RNPluginCheckbox: SDKPlugin =  (artBoardWithContext) => {
    //自上至下递归处理VIEW结点
    artBoardWithContext.viewTree = visitViewTree(artBoardWithContext.viewTree,node => {
        //View对应sketch symbol '按钮/标准按钮/正常态btn_blue_a'
        if(node.symbol?.type=="控件/Checkbox/checked"){
            return replace(node,"1");
        }

        if(node.symbol?.type=="控件/Checkbox/unchecked"){
            return replace(node,"0");
        }
        return node;
    });
    return artBoardWithContext;
}

export default RNPluginCheckbox;
