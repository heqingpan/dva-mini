# dva-mini
a purely dva model package,independent other package.

dva-mini是一个支持按dva结构组织redux state,reducers,action,effect的极简库。

dvajs依赖太重，因依赖的库版本较老，目前按其文档创建应用都运行不起来。

轻量级的dva-mini支持dva模型，它没有依赖任何的库，不会因版本问题跑不起来。


# instructions

1. definition model 


```js
//file: model/count.js
export default {
    namespace: 'count',
    state: 0,
    reducers: {
      add (count) { 
          return count + 1 
      },
      minus (count) { 
          return count - 1 
      },
    },
    effects: {
        *add_effect(a,{put,select}) {
            var state = yield select();
            console.log("add_effect select state",state)
            //dispatch this namespace action
            //yield put({"type":"count/add"});
            yield put({"type":"add"});

            //dispatch other namespace action
            yield put({"type":"user/login"});
        }
    }
};
```


```js
//file: model/user.js
export default {
    namespace: 'user',
    state: {
        name:"",
        status:"INIT",
    },
    reducers: {
      login(state) { 
          return {...state,status:"LOGIN"}
      },
      logout(state) { 
          return {...state,status:"LOGOUT"}
      },
    },
    effects: {
    }
}
```

2. build dva 

input models,convert output rootReducer,rootSaga

```js
import CountModel from './model/count'
import UserModel from './model/user'

import {buildDva} from 'dva-mini'

import * as effects from 'redux-saga/effects';

let {rootReducer,rootSaga} = buildDva([
    CountModel,
    UserModel
],effects)

```


3. use redux sage

```js
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

```


4. whole page exp:

```js
import { createStore, applyMiddleware } from 'redux';
import { Provider,connect } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import * as effects from 'redux-saga/effects';
import {buildDva} from 'dva-mini'

import CountModel from './model/count'
import UserModel from './model/user'

let {rootReducer,rootSaga} = buildDva([
    CountModel,
    UserModel
],effects)

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

const App = connect(({ count }) => ({
    count
  }))(function(props) {
    return (
      <div>
        <h2>{ props.count }</h2>
        <button key="add" onClick={() => { props.dispatch({type: 'count/add_effect'})}}>+</button>
        <button key="minus" onClick={() => { props.dispatch({type: 'count/minus'})}}>-</button>
      </div>
    );
  });

const MainPage= () => 
  <Provider store={store}>
    <App />
  </Provider>

export default MainPage 


```