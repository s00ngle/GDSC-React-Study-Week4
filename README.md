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

### React developer tools

-   Chrome 확장 프로그램 "React Developer Tools"
    -   컴포넌트 계층 구조 가시화
    -   각 컴포넌트의 state, props, key값 등을 쉽게 확인할 수 있다.
    -   rerender되는 컴포넌트 하이라이트 기능

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

### 최적화 4 - 최적화 완성

### 복잡한 상태 관리 로직 분리하기 - useReducer

### 컴포넌트 트리에 데이터 공급하기 - Context
