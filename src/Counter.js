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

const Counter2 = () => {
    const [count, dispatch] = useReducer(reducer, 1);

    return (
        <div>
            {count}
            <button onClick={() => dispatch({ type: 1 })}>add 1</button>
            <button onClick={() => dispatch({ type: 10 })}>add 10</button>
            <button onClick={() => dispatch({ type: 100 })}>add 100</button>
            <button onClick={() => dispatch({ type: 1000 })}>add 1000</button>
            <button onClick={() => dispatch({ type: 10000 })}>add 10000</button>
        </div>
    );
};
