import * as Utils from './SDKRenderUtils';
import * as SDKProcess from './SDKProcess';
import  SDKRenderRN from './SDKRenderRN';
import  SDKRenderReact from './SDKRenderReact';
import  SDKRenderVue from './SDKRenderVue';
import  SDKRenderAndroid from './SDKRenderAndroid';

const Render = {
    SDKRenderRN,
    SDKRenderReact,
    SDKRenderVue,
    SDKRenderAndroid
}

export {
    Render,
    Utils,
    SDKProcess
}
