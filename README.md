# CodeByAI 二次开发(定制)
插件可原生支持图片/文本/文本输入/View/触控背景切换；为扩展功能，
CodeByAI提供了二次开发工具SDK，可以实现公司自定义组件替换。

[CodeByAI-SDK](https://github.com/laotian/codebyai-sdk) 开源项目，采用TS语言开发,开发者可先fork，然后clone到本地并在源码基础上修改。
需先安装[node.js](https://nodejs.org/en/) ,版本不低于v12.10.0; 
从fork后的仓库clone,例
```
git clone https://github.com/laotian/codebyai-sdk
cd codebyai-sdk
npm install
```

### 协作
为实现替换，开发者和设计师要共用一套标准基础控件。  
设计师通过Sketch Symbol定义组件，并通过约定的图层名称标识组件的各部分。  
插件导出的布局信息包含组件名称，开发者可通过SDK识别组件名称，替换为项目组件。

[Sketch导出]->[读取布局信息]->[处理插件1].....[处理插件N]->[输出]->[保存/预览]


### 布局信息
打开sketch导出的代码目录，可在"CodeByAI"目录找到customized.json
customized.json包含VIEW布局信息，为VIEW树结构,对应生成的每个VIEW。
```ts
/**
 * ViewTree
 */
export interface RenderNode {
    //view名称, EditText/ImageView/div...
    viewName:string,
    //View Props, android:text/onPress...
    props:{
        name:string,
        value?:string,
        //RN 专有，代表view为表达式 {} 或普通字符串
        expression?:boolean,
    }[],
    //RN/REACT/VUE view类名
    className:string[],
    //文本内容
    content?:string,
    //RN/REACT/VUE styles, color/marginTop...
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
    //view children, 可修改
    children:RenderNode[],
    //UDID仅用以调试,不用以输出,非 android:id
    id:string,
    //sketch 图层格式化名称,会被用以样式名称
    name:string,
    //sketch图层绝对布局,用以在网页端预览位置
    layout: {
        left:number;
        top:number;
        right:number;
        bottom:number;
    },
    //sketch symbol名称,用以替换自定义组件
    symbol?:{
        //sketch symbol内部图层名称,如title
        name:string,
        //sketch symbol类型,如标准控件/开关/开
        type:string;
    },
    //代码注释，保留,暂未使用
    notes?:string,
}

```

### 替换示例 - RN按钮
针对项目语言为每个基础控件开发一个处理插件，插件根据view结点的symbol.type判断控件类型，并根据children 子VIEW中的symbol.name判断出控件内容（如文本/图标）,替换此view结点生成对应的自定义控件; 
假如右侧"确认提交"为标准组件，

![submit image](https://service.codebyai.com/images/btn_blue_a.png)



对应的sketch symbol
![submit_image_sketch_symbol](https://service.codebyai.com/images/symbol_btn_blue_a.png)

##### 替换前为VIEW嵌套
```jsx
<View style={{ flex: 1, marginLeft: 15, marginRight: 14.5 }}>
            <View style={styles.titleContainer}>
              <Text style={{ fontSize: 16, color: "#FFFFFF" }}>确定提交</Text>
            </View>
          </View>
```


##### 替换后为组件库按钮
```jsx
<CButton text='确定提交' type={{CButton.blue}} style={{ flex: 1, marginLeft: 15, marginRight: 14.5 }} />
```
可在SDKRenderRN模版中添加CButton导包

#### 插件代码
位于plugins/rn/RNPluginButton.ts
```ts
import {SDKPlugin} from '../../DataDefs';
import {filterViewTree, visitViewTree} from '../../SDKRenderUtils';

/**
 * 自定义按钮替换演示插件
 */
const RNPluginButton: SDKPlugin =  (artBoardWithContext) => {
    //自上至下递归处理VIEW结点
    artBoardWithContext.viewTree = visitViewTree(artBoardWithContext.viewTree,node => {
        //view对应sketch symbol '按钮/标准按钮/正常态btn_blue_a'
        if(node.symbol?.type=="按钮/标准按钮/正常态btn_blue_a"){
            //从以node为根结点的树中查找按钮标题,title为文本图层名称
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
                //清除嵌套VIEW
                node.children = [];
            }
        }
        return node;
    });
    return artBoardWithContext;
}

export default RNPluginButton;
}


```

在SDKMain中，针对项目语言配置插件设置.

### 添加插件后运行
编译TS,在项目根目录下执行TS编译
```
npm run build
```

执行
```
node ./build/SDKMain.js 要转换的项目目录
```

即可在要转换的项目目录/CodeByAI/RN等目录中找到包含-custom等转换后的文件，然后打开 要转换的项目目录下的index.html 选择代码类型为 "XX自定义“ 查看.

为便于命令行调用，可在转换脚本根目录执行
```
sudo npm install -g .
```
之后，即可在任意目录调用脚本调用
```
codebyai 要转换的项目目录
```    
