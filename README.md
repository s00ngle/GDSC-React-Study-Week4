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

-   Chrome 확장 프로그램 "React Developer Tools"
    -   컴포넌트 계층 구조 가시화
    -   각 컴포넌트의 state, props, key값 등을 쉽게 확인할 수 있다.
    -   rerender되는 컴포넌트 하이라이트 기능

### 최적화 1 - useMemo

-   연산 결과 재사용

    -   Memoization
        이미 계산한 결과를 기억 해 두었다가 동일한 연산 수행 시 다시 연산하지 않고 기억 해 두었던 데이터를 반환하는 방법
    -   useMemo

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
    <img src="/README_img/norerender.png" width="500px" height="300px"></img><br/>

### 최적화 3 - useCallback

### 최적화 4 - 최적화 완성

### 복잡한 상태 관리 로직 분리하기 - useReducer

### 컴포넌트 트리에 데이터 공급하기 - Context
