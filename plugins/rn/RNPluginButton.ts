import {SDKPlugin} from '../../DataDefs';
import {filterViewTree, visitViewTree} from '../../SDKRenderUtils';

/**
 * 自定义按钮替换演示插件
 */
const RNPluginButton: SDKPlugin =  (artBoardWithContext) => {
    //自上至下递归处理VIEW结点
    artBoardWithContext.viewTree = visitViewTree(artBoardWithContext.viewTree,node => {
        //View对应sketch symbol '按钮/标准按钮/正常态btn_blue_a'
        if(node.symbol?.type=="按钮/标准按钮/正常态btn_blue_a"){
            //从以node为根结点的树中查找按钮标题
            const titleView = filterViewTree(node).find(child=>child.symbol?.name==="title");
            if(titleView){
                node.viewName = "CButton";
                node.props.push({
                    name:'text',
                    value:titleView.content,
                });
                node.props.push({
                    name:'type',
                    value: '{CButton.blue}',
                    expression:true,
                });
                node.children = [];
            }

        }
        return node;
    });
    return artBoardWithContext;
}

export default RNPluginButton;
