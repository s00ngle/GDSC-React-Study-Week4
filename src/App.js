import "./App.css";
import { useState, useRef } from "react";
import DiaryEditor from "./DiaryEditor";
import DiaryList from "./DiaryList";
import Lifecycle from "./Lifecycle";

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

    return (
        <div className="App">
            <Lifecycle />
            <DiaryEditor onCreate={onCreate} />
            <DiaryList onEdit={onEdit} onRemove={onRemove} diaryList={data} />
        </div>
    );
}

export default App;
