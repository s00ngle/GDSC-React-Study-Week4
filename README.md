# GDSC React 스터디 4주차

## React 기본 - 일기장 만들어보기 (2)

### React Lifecycle 제어하기 - useEffect

-   Lifecycle?

    -   탄생 : Mount
    -   변화 : Update
    -   죽음 : UnMount

-   `useEffect`
    ```javascript
    useEffect(() => {
        console.log("Mount!");
        return () => {
            console.log("Unmount!");
        };
    }, [Dependency Array]);
    ```

---

### React에서 API 호출하기

-   jsonplaceholder API 사용하기

    ```javascript
    const [data, setData] = useState([]);

    const dataId = useRef(0);

    const getData = async () => {
        const res = await fetch(
            "https://jsonplaceholder.typicode.com/comments"
        ).then((res) => res.json());

        const initData = res.slice(0, 20).map((it) => {
            return {
                author: it.email,
                content: it.body,
                emotion: Math.floor(Math.random() * 5) + 1,
                created_date: new Date().getTime(),
                id: dataId.current++,
            };
        });
        setData(initData);
    };

    useEffect(() => {
        getData();
    }, []);
    ```

---

### React developer tools

-   Chrome 확장 프로그램 "React Developer Tools"
    -   컴포넌트 계층 구조 가시화
    -   각 컴포넌트의 state, props, key값 등을 쉽게 확인할 수 있다.
    -   rerender되는 컴포넌트 하이라이트 기능

---

### 최적화 1 - useMemo

-   연산 결과 재사용

    -   Memoization
        이미 계산한 결과를 기억 해 두었다가 동일한 연산 수행 시 다시 연산하지 않고 기억 해 두었던 데이터를 반환하는 방법

-   `useMemo`

    ```javascript
    const getDiaryAnalysis = useMemo(() => {
        console.log("일기 분석 시작");
        const goodCount = data.filter((it) => it.emotion >= 5).length;
        const badCount = data.length - goodCount;
        const goodRatio = (goodCount / data.length) * 100;
        return { goodCount, badCount, goodRatio };
    }, [data.length]);

    const { goodCount, badCount, goodRatio } = getDiaryAnalysis;
    ```

---

### 최적화 2 - React.memo

-   컴포넌트 재사용

    <img src="/README_img/update.png" width="500px" height="450px"></img><br/>

    업데이트 조건을 걸어준다.

-   `React.memo`

    ```javascript
    const Textview = React.memo(({ text }) => {
        useEffect(() => {
            console.log(`Update : Text : ${text}`);
        });
        return <div>{text}</div>;
    });

    const Countview = React.memo(({ count }) => {
        useEffect(() => {
            console.log(`Update :: Count : ${count}`);
        });
        return <div>{count}</div>;
    });

    const OptimizeTest = () => {
        const [count, setCount] = useState(1);
        const [text, setText] = useState("");

        return (
            <div style={{ padding: 50 }}>
                <div>
                    <h2>count</h2>
                    <Countview count={count} />
                    <button onClick={() => setCount(count + 1)}>+</button>
                </div>
                <div>
                    <h2>text</h2>
                    <Textview text={text} />
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
            </div>
        );
    };
    ```

-   객체의 얕은 비교로 인한 문제

    -   javascript는 객체의 주소에 의한 비교(얕은 비교)를 하기 때문

        ```javascript
        const CounterB = React.memo(({ obj }) => {
            useEffect(() => {
                console.log(`CounterB Update - count: ${obj.count}`);
            });
            return <div>{obj.count}</div>;
        });

        const OptimizeTest = () => {
            const [obj, setObj] = useState({
                count: 1,
            });

            return (
                <div style={{ padding: 50 }}>
                    <div>
                        <h2>Counter B</h2>
                        <CounterB obj={obj} />
                        <button onClick={() => setObj({ count: obj.count })}>
                            B button
                        </button>
                    </div>
                </div>
            );
        };
        ```

    -   아래와 같이 React.memo 안에 `areEqual()` 함수를 구현해서 사용하면 된다.

        ```javascript
        const CounterB = ({ obj }) => {
            useEffect(() => {
                console.log(`CounterB Update - count: ${obj.count}`);
            });
            return <div>{obj.count}</div>;
        };

        const areEqual = (prevProps, nextProps) => {
            return prevProps.obj.count === nextProps.obj.count;
        };

        const MemoizedCounterB = React.memo(CounterB, areEqual);

        const OptimizeTest = () => {
            // const [count, setCount] = useState(1);
            // const [text, setText] = useState("");

            const [count, setCount] = useState(1);
            const [obj, setObj] = useState({
                count: 1,
            });

            return (
                <div style={{ padding: 50 }}>
                    <div>
                        <h2>Counter B</h2>
                        <MemoizedCounterB obj={obj} />
                        <button onClick={() => setObj({ count: obj.count })}>
                            B button
                        </button>
                    </div>
                </div>
            );
        };
        ```

---

### 최적화 3 - useCallback

-   `data` state가 초기값 `[]` 로 존재하다가 App 컴포넌트가 한 번 렌더링이 일어나고, DiaryEditor도 렌더링이 일어난다.

    이후 컴포넌트가 Mount된 시점에 호출한 `getData()` 함수의 결과를 `setData()` 에 전달하게 되면서 data state가 한 번 더 바뀌게 된다. 따라서 App 컴포넌트는 Mount 되자마자 2번의 렌더링이 진행된다.

    때문에 DiaryEditor 컴포넌트가 전달받는 `onCreate()` 함수도 App 컴포넌트가 렌더링 되면서 다시 생성된다.

    결론적으로 `DiaryEditor`의 onCreate() 함수가 App 컴포넌트가 렌더링 될 때 마다 다시 만들어지기 때문에 DiaryEditor의 렌더링이 발생한다.

    그러나 `DiaryEditor` 컴포넌트는 일기를 삭제했을 때 렌더링 될 필요가 없다.

    onCreate() 함수가 다시 생성되지 않게 만들어야 하는데, `useMemo()` 기능은 함수가 아니라 값을 반환하기 때문에 사용할 수 없다.

    이 때 사용할 수 있는 기능이 `useCallback()` 이다.

-   `useCallback` : 메모이제이션된 콜백을 반환하는 기능

    ```javascript
    const memoizedCallback = useCallback(() => {
        doSomething(a, b);
    }, [a, b]);
    ```

    두 번째 인자로 전달한 dependency array 안에 들어있는 값이 변하지 않으면 첫 번째 인자로 전달한 콜백 함수를 계속 재사용 할 수 있도록 도와주는 리액트 Hook이다.

-   useCallback을 사용해서 최적화 하기

    1.  `DiaryEditor.js` 를 `React.memo()`로 감싸준다.

        ```javascript
        export default React.memo(DiaryEditor);
        ```

        ```javascript
        const onCreate = useCallback((author, content, emotion) => {
            const created_date = new Date().getTime();
            const newItem = {
                author,
                content,
                emotion,
                created_date,
                id: dataId.current,
            };
            dataId.current += 1;
            setData((data) => [newItem, ...data]);
        }, []);
        ```

    2.  `useCallback()` 으로 `onCreate()`를 감싼다.

        ```javascript
        const onCreate = useCallback((author, content, emotion) => {
            const created_date = new Date().getTime();
            const newItem = {
                author,
                content,
                emotion,
                created_date,
                id: dataId.current,
            };
            dataId.current += 1;
            setData([newItem, ...data]);
        }, []);
        ```

        하지만 이렇게 하면 저장하기를 했을 때 작성한 하나의 일기만 남게 된다.

        useCallback()을 사용하면서 `dependency array`에 아무 값도 넣어주지 않아 처음 빈 배열 [] 에 `newItem` 하나만 추가해 주기 때문이다.

        ```javascript
        const onCreate = useCallback(
            (author, content, emotion) => {
                const created_date = new Date().getTime();
                const newItem = {
                    author,
                    content,
                    emotion,
                    created_date,
                    id: dataId.current,
                };
                dataId.current += 1;
                setData([newItem, ...data]);
            },
            [data]
        );
        ```

        하지만 이런식으로 dependency array에 `data`를 추가해 주게 되면 data가 변경될 때 마다 onCreate() 함수를 재생성하기 때문에 원하는 동작을 할 수 없다.

        data state가 변화한다고 해서 onCreate() 함수가 재생성 되지 않길 원하지만, onCreate() 함수가 재생성되지 않으면 최신의 data state 값을 참고할 수 없기 때문에 딜레마에 빠진다.

        이런 상황에서는 `함수형 업데이트` 라는 걸 활용하면 된다.

        ```javascript
        const onCreate = useCallback((author, content, emotion) => {
            // ...생략
            setData((data) => [newItem, ...data]);
        }, []);
        ```

        화살표 함수의 형태로 data를 인자로 받아 newItem을 추가한 data를 리턴받는 콜백함수를 setData() 함수한테 전달하면된다.

        이와 같이 `setState()` 함수에 함수를 전달하는 것을 `함수형 업데이트`라고 한다.

        이런 방식을 사용하면 `dependency array`를 비워도 된다.

-   위 동작들로 DiaryEditor의 불필요한 리렌더링을 방지할 수 있다.

---

### 최적화 4 - 최적화 완성

-   `DiaryItem` 최적화

    하나의 일기를 삭제하면 모든 DiaryItem에 대한 리렌더가 발생하는 현상을 방지해보자

    -   DiaryItem의 props 중에 변화할 수 있는 데이터 : `onEdit`, `onRemove`, `content`

    1. `DiaryItem` 컴포넌트를 `React.memo()` 로 묶어준다.

        ```javascript
        export default React.memo(DiaryItem);
        ```

    2. `onEdit`, `onRemove` 함수는 `data` state가 변화하면 재생성되는 함수들이기 때문에 App 컴포넌트에서 최적화 해 준다.

        ```javascript
        const onRemove = (targetId) => {
            setData(data.filter((it) => it.id !== targetId));
        };

        const onEdit = (targetId, newContent) => {
            setData(
                data.map((it) =>
                    it.id === targetId ? { ...it, content: newContent } : it
                )
            );
        };
        ```

        위 상태의 코드를 아래와 같이 수정해준다.

        ```javascript
        const onRemove = useCallback((targetId) => {
            setData((data) => data.filter((it) => it.id !== targetId));
        }, []);

        const onEdit = useCallback((targetId, newContent) => {
            setData((data) =>
                data.map((it) =>
                    it.id === targetId ? { ...it, content: newContent } : it
                )
            );
        }, []);
        ```

    이제 하나의 일기를 삭제해도 다른 모든 일기 아이템들이 렌더링 되지 않는다.

---

### 복잡한 상태 관리 로직 분리하기 - useReducer

-   현재까지 사용된 상태 변화 처리 함수

    -   onCreate
    -   onEdit
    -   onRemove

    상태 변화 함수들은 컴포넌트 안에만 존재해야했다.

    상태를 업데이트 하기 위해서는 기존의 상태를 참조해야 했기 때문이다.

-   `useReducer`

    상태변화 로직들을 컴포넌트에서 분리할 수 있게 되어 컴포넌트를 더욱 가볍게 작성할 수 있도록 도와준다.

    ```javascript
    const Counter = () => {
        const [count, setCount] = useState(1);

        const add1 = () => {
            setCount(count + 1);
        };
        const add10 = () => {
            setCount(count + 10);
        };
        const add100 = () => {
            setCount(count + 100);
        };
        const add1000 = () => {
            setCount(count + 1000);
        };
        const add10000 = () => {
            setCount(count + 10000);
        };

        return (
            <div>
                {count}
                <button onClick={add1}>add 1</button>
                <button onClick={add10}>add 10</button>
                <button onClick={add100}>add 100</button>
                <button onClick={add1000}>add 1000</button>
                <button onClick={add10000}>add 10000</button>
            </div>
        );
    };
    ```

    위 코드를 `useReducer()`를 사용해 아래와 같이 작성할 수 있다.

    ```javascript
    const reducer = (state, action) => {
        switch (action.type) {
            case 1:
                return state + 1;
            case 10:
                return state + 10;
            case 100:
                return state + 100;
            case 1000:
                return state + 1000;
            case 10000:
                return state + 10000;
            default:
                return state;
        }
    };

    const Counter = () => {
        const [count, dispatch] = useReducer(reducer, 1);

        return (
            <div>
                {count}
                <button onClick={() => dispatch({ type: 1 })}>add 1</button>
                <button onClick={() => dispatch({ type: 10 })}>add 10</button>
                <button onClick={() => dispatch({ type: 100 })}>add 100</button>
                <button onClick={() => dispatch({ type: 1000 })}>
                    add 1000
                </button>
                <button onClick={() => dispatch({ type: 10000 })}>
                    add 10000
                </button>
            </div>
        );
    };
    ```

    -   첫 번째 인자 : `state`

    -   두 번째 인자(`dispatch`) : 상태를 변화시키는 action을 발생시키는 함수

    -   useReducer 첫 번째 인자(`reducer` 함수) : `dispatch`가 발생시킨 상태변화를 처리해주는 함수

    -   useReducer 두 번째 인자 : state의 `초기값`

    -   dispatch 안에 전달되는 객체({ type: 1 }) : `Action` 객체

-   App 컴포넌트로부터 data 상태변화 로직 분리하기

    1. `useState` 주석처리
        ```javascript
        //const [data, setData] = useState([]);
        ```
    2. `useReducer`를 사용해서 구현

        ```javascript
        const reducer = (state, action) => {
            switch (action.type) {
                case "INIT": {
                    return action.data;
                }
                case "CREATE": {
                    const created_date = new Date().getTime();
                    const newItem = {
                        ...action.data,
                        created_date,
                    };
                    return [newItem, ...state];
                }
                case "REMOVE": {
                    return state.filter((it) => it.id !== action.targetId);
                }
                case "EDIT": {
                    return state.map((it) =>
                        it.id === action.targetId
                            ? { ...it, content: action.newContent }
                            : it
                    );
                }
                default:
                    return state;
            }
        };
        ```

        ```javascript
        function App() {
        // const [data, setData] = useState([]);
        const [data, dispatch] = useReducer(reducer, []);

        const dataId = useRef(0);

        const getData = async () => {
            const res = await fetch(
                "https://jsonplaceholder.typicode.com/comments"
            ).then((res) => res.json());

            const initData = res.slice(0, 20).map((it) => {
                return {
                    author: it.email,
                    content: it.body,
                    emotion: Math.floor(Math.random() * 5) + 1,
                    created_date: new Date().getTime(),
                    id: dataId.current++,
                };
            });
            dispatch({ type: "INIT", data: initData });
        };

        useEffect(() => {
            getData();
        }, []);

        const onCreate = useCallback((author, content, emotion) => {
            dispatch({
                type: "CREATE",
                data: { author, content, emotion, id: dataId.current },
            });
            dataId.current += 1;
        }, []);

        const onRemove = useCallback((targetId) => {
            dispatch({ type: "REMOVE", targetId });
        }, []);

        const onEdit = useCallback((targetId, newContent) => {
            dispatch({ type: "EDIT", targetId, newContent });
        }, []);
        ```

---

### 컴포넌트 트리에 데이터 공급하기 - Context

-   `DiaryList` 컴포넌트에서 `onRemove()`, `onEdit()`은 사용되지 않고 `DiaryItem` 에게 건네주기 위해 거쳐가기만 하는 Props들이다.

    이런 경우를 `Props Drilling` 이라고 한다.

    이런식으로 전달만 하는 컴포넌트가 많아질 경우 Props의 이름을 바꾸기도 어려워지고, 코드 작성과 수정에 상당한 악영향을 끼치게 된다.

    Props Drilling을 해결하기 위해 나온 것이 바로 `Context` 이다.

-   `Context` 생성

    ```javascript
    const MyContext = React.createContext(defaultValue);
    ```

-   `Context Provider`를 통한 데이터 공급

    ```javascript
    <MyContext.Provider value={전역으로 전달하고자 하는 값}>
        {/*이 Context 안에 위치할 자식 컴포넌트들*/}
    </MyContext.Provider>
    ```

-   프로젝트에 적용

    ```javascript
    export const DiaryStateContext = React.createContext();
    ```

    -   App 컴포넌트가 return하는 부분의 최상위 태그를 변경해주어야 한다.

        ```javascript
        function App() {
            // ...
            return (
                <DiaryStateContext.Provider value={data}>
                    <div className="App">내용</div>
                </DiaryStateContext.Provider>
            );
        }
        ```

    -   `DiaryList` 컴포넌트의 Props 중에서 거쳐가기만 하는 `diaryList` 를 삭제한 뒤 `Context` 에서 받아온다.
        ```javascript
        const DiaryList = ({ onEdit, onRemove }) => {
            const diaryList = useContext(DiaryStateContext);
            // ...
        };
        ```
    -   상태 변화 함수 Context로 공급하기

        DiaryStateContext.Provider의 props로 onEdit, onRemove를 전부 전달하면 될 것 같지만, 이런 방식으로 공급하면 안된다.

        Provider 또한 컴포넌트이기 때문에 props가 바뀌면 재생성되고, 밑에있는 컴포넌트들도 전부 재생성된다. 그렇기 때문에 data와 함께 onEdit, onRemove를 같이 보내버리면 data state가 바뀔 때 마다 렌더링이 일어나게 되어 최적화가 풀려버리게 된다.

        이럴땐 Context를 중첩으로 사용하면 된다.

        ```javascript
        export const DiaryStateContext = React.createContext();
        export const DiaryDispatchContext = React.createContext();

        function App() {
            // ...
            return (
                <DiaryStateContext.Provider value={data}>
                    <DiaryDispatchContext.Provider>
                        <div className="App">내용</div>
                    </DiaryDispatchContext.Provider>
                </DiaryStateContext.Provider>
            );
        }
        ```

        `memoizedDispatches` 는 절대 재생성 될 일이 없게 dependency array를 빈 배열로 저장한다.

        ```javascript
        const memoizedDispatches = useMemo(() => {
            return { onCreate, onRemove, onEdit };
        }, []);
        ```

        `memoizedDispatches` 를 `DiaryDispatchContext.Provider` 의 value 로 전달해준다.

        ```javascript
        function App() {
            // ...
            return (
                <DiaryStateContext.Provider value={data}>
                    <DiaryDispatchContext.Provider>
                        <div className="App">내용</div>
                    </DiaryDispatchContext.Provider>
                </DiaryStateContext.Provider>
            );
        }
        ```

        이제 onCreate, onEdit, onRemove를 Props로 전달할 필요가 없다.

-   `export` 와 `default export` 의 차이
    ```javascript
    import React, {
        useRef,
        useEffect,
        useMemo,
        useCallback,
        useReducer,
    } from "react";
    ```
    -   `default export` 는 한 가지만 가능하며 import 시 이름 변경이 가능하다.
    -   `export` 는 여러가지 가능하며 import 시 이름 변경이 불가능하고, 비구조화 할당으로만 import 받을 수 있다.
