# GDSC React 스터디 4주차

## React 기본 - 일기장 만들어보기 (2)

### React Lifecycle 제어하기 - useEffect

-   Lifecycle?

    -   탄생 : Mount
    -   변화 : Update
    -   죽음 : UnMount

-   useEffect
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

### 최적화 1 - useMemo

### 최적화 2 - React.memo

### 최적화 3 - useCallback

### 최적화 4 - 최적화 완성

### 복잡한 상태 관리 로직 분리하기 - useReducer

### 컴포넌트 트리에 데이터 공급하기 - Context
