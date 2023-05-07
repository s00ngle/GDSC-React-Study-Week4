import "./App.css";
import { useState, useRef, useEffect, useMemo } from "react";
import DiaryEditor from "./DiaryEditor";
import DiaryList from "./DiaryList";
// import Lifecycle from "./Lifecycle";

// https://jsonplaceholder.typicode.com/comments

// const dummyList = [
//     {
//         id: 1,
//         author: "soongle",
//         content: "hi 1",
//         emotion: 1,
//         created_date: new Date().getTime(),
//     },
//     {
//         id: 2,
//         author: "gildong",
//         content: "hi 2",
//         emotion: 3,
//         created_date: new Date().getTime(),
//     },
//     {
//         id: 3,
//         author: "amugae",
//         content: "hi 3",
//         emotion: 5,
//         created_date: new Date().getTime(),
//     },
// ];

function App() {
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

    const onCreate = (author, content, emotion) => {
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
    };

    const onRemove = (targetId) => {
        console.log(`${targetId}가 삭제되었습니다`);
        setData(data.filter((it) => it.id !== targetId));
    };

    const onEdit = (targetId, newContent) => {
        setData(
            data.map((it) =>
                it.id === targetId ? { ...it, content: newContent } : it
            )
        );
    };

    const getDiaryAnalysis = useMemo(() => {
        console.log("일기 분석 시작");
        const goodCount = data.filter((it) => it.emotion >= 5).length;
        const badCount = data.length - goodCount;
        const goodRatio = (goodCount / data.length) * 100;
        return { goodCount, badCount, goodRatio };
    }, [data.length]);

    const { goodCount, badCount, goodRatio } = getDiaryAnalysis;

    return (
        <div className="App">
            {/* <Lifecycle /> */}
            <DiaryEditor onCreate={onCreate} />
            <div>전체 일기 : {data.length}</div>
            <div>기분 좋은 일기 개수 : {goodCount}</div>
            <div>기분 나쁜 일기 개수 : {badCount}</div>
            <div>기분 좋은 일기 비율 : {goodRatio.toFixed(0)}%</div>
            <DiaryList onEdit={onEdit} onRemove={onRemove} diaryList={data} />
        </div>
    );
}

export default App;
