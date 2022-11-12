/*
const expModel= {
    namespace : "exp",
    state: {},
    effects: {}, //*function
    reducers: {}, //function
}
*/

//return reducerRoot,sagaRoot
export const buildDva = function(models,{call,apply,put,fork,select,takeEvery,all}){
    var defaultState = {};
    var reducers = {};
    var sagas = [];
    function watchType(namespace,actionType,effectFunc){
        return function*(){
            var warpPut = function*(action){
                if(action && typeof(action.type)==='string'){
                    var splits = action.type.split("/");
                    if(splits.length===1){
                        action.type=namespace+"/"+splits[0];
                    }
                }
                yield put(action)
            };
            yield takeEvery(actionType,(action) => (
                effectFunc(action,{call,apply,put:warpPut,select})
            ))
        }
    }

    for(var i in models){
        var model = models[i];
        var namespace = model.namespace;
        if(!namespace){
            continue;
        }
        //state
        var modelState = model.state;
        if(modelState===undefined){
            modelState={}
        }
        defaultState[namespace]=modelState;

        //effects
        var modelEffects = model.effects || {};
        for(var k in modelEffects){
            sagas.push(fork(watchType(namespace,namespace+"/"+k,modelEffects[k])));
        }

        //reducers
        var modelReducers = model.reducers || {};
        for (var k in modelReducers){
            reducers[namespace+"/"+k] = modelReducers[k];
        }
    }

    //console.log("createDvaStore",defaultState,reducers)
    var rootReducer = function(state,actions){
        if (state===undefined || actions===undefined || actions.type===undefined){
            var state = Object.assign({},defaultState);
            return state
        }
        var actionType = actions.type;
        var namespace = actionType.split("/")[0];
        var reducer = reducers[actionType];
        var keyState = state[namespace];
        if(keyState===undefined){
            keyState = defaultState[namespace]
        }
        if(typeof(reducer)==='function'){
            var keyNewState  = reducer(keyState,actions);
            if(keyNewState!==keyState){
                var newState = Object.assign({},state)
                state = newState;
                state[namespace]  = keyNewState;
            }
        }
        return state;
    }
    var rootSaga = function*(){
        if(sagas.length>0){
            yield all(sagas);
        }
    }
    return {rootReducer,rootSaga};
}