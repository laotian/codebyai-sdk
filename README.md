The plug-in can natively support picture/text/text input/View/touch background switching; for extended functions,
CodeByAI provides a secondary development tool SDK, which can replace the company's custom components.
[中文文档](https://github.com/laotian/codebyai-sdk/wiki/CodeByAI-二次开发)

[CodeByAI-SDK](https://github.com/laotian/codebyai-sdk) Open source project, developed in TS language, developers can first fork, then clone to local and modify on the basis of source code.
[Node.js](https://nodejs.org/en/) needs to be installed first, the version is not lower than v12.10.0;
Clone from the warehouse after the fork, for example
```
git clone https://github.com/laotian/codebyai-sdk
cd codebyai-sdk
npm install
```

### Collaboration
To achieve replacement, developers and designers must share a standard set of basic controls.
The designer defines the component through Sketch Symbol, and identifies each part of the component through the agreed layer name.
The layout information exported by the plug-in contains the component name, and the developer can identify the component name through the SDK and replace it with the project component.

[Sketch Export]->[Read Layout Information]->[Processing Plugin 1].....[Processing Plugin N]->[Output]->[Save/Preview]


### Layout information
Open the code directory exported by sketch, you can find customized.json in the "CodeByAI" directory
customized.json contains VIEW layout information, which is a VIEW tree structure, corresponding to each generated VIEW.
```ts
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
}

```

### Replacement example-RN button
For each basic control, a processing plug-in is developed for the project language. The plug-in determines the type of the control according to the symbol.type of the view node, and determines the content of the control (such as text/icon) according to the symbol.name in the children sub-VIEW, replacing this view The node generates the corresponding custom control;
If the "Confirm Submission" on the right is a standard component,

![submit image](https://service.codebyai.com/images/btn_blue_a.png)


Corresponding sketch symbol

![submit_image_sketch_symbol](https://service.codebyai.com/images/symbol_btn_blue_a.png)

##### VIEW nesting before replacement
```jsx
<View style={{ flex: 1, marginLeft: 15, marginRight: 14.5 }}>
            <View style={styles.titleContainer}>
              <Text style={{ fontSize: 16, color: "#FFFFFF" }}>submit</Text>
            </View>
          </View>
```


##### After replacement, the component library button
```jsx
<CButton text='submit' type={{CButton.blue}} style={{ flex: 1, marginLeft: 15, marginRight: 14.5 }} />
```
CButton guide package can be added in SDKRenderRN template

#### Plugin code
Located in plugins/rn/RNPluginButton.ts
```ts
import {SDKPlugin} from'../../DataDefs';
import {filterViewTree, visitViewTree} from'../../SDKRenderUtils';

/**
 * Custom button replacement demo plugin
 */
const RNPluginButton: SDKPlugin = (artBoardWithContext) => {
    //Recursively process VIEW nodes from top to bottom
    artBoardWithContext.viewTree = visitViewTree(artBoardWithContext.viewTree,node => {
        //view corresponds to sketch symbol'button/standard button/normal state btn_blue_a'
        if(node.symbol?.type=="button/standard button/normal state btn_blue_a"){
            //Find the button title from the tree with node as the root node, title is the name of the text layer
            const titleView = filterViewTree(node).find(child=>child.symbol?.name==="title");
            if(titleView){
                node.viewName = "CButton";
                node.props.push({
                    name:'text',
                    value:titleView.content,
                });
                node.props.push({
                    name:'type',
                    value:'{CButton.blue}',
                    expression:true,
                });
                //Clear nested VIEW
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

In SDKMain, configure the plugin settings for the project language.

### Run after adding the plugin
Compile TS, perform TS compilation in the project root directory
```
npm run build
```

carried out
```
node ./build/SDKMain.js the project directory to be converted
```

You can find the converted files including -custom in the directory of the project to be converted /CodeByAI/RN, and then open the index.html under the directory of the project to be converted and select the code type as "XX custom" to view.

In order to facilitate the command line call, it can be executed in the root directory of the conversion script
```
sudo npm install -g.
```
After that, you can call the script call in any directory
```
codebyai The project directory to be converted
```
