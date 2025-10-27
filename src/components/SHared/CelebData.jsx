import { useEffect, useState } from "react";
import Search from "./Search";

const CelebData = () => {
    const [celebDta, setCelebData] = useState('');

    useEffect(() => {
        let respone = fetch('https://jsonplaceholder.typicode.com/posts') \



    }, [])

    return (
        <>
            <div>
                <p> Celeb Data</p>
                <Search />
                {celebDta}
            </div>
        </>
    )
}

export default CelebData;