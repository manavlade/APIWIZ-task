import { useState } from "react";

const Search = (onSearch) => {

    const [search, setSearch] = useState("");

    const handleSearch = () => {
        setSearch(onSearch);
        
    }

    return (
        <>
            <div>
                <input
                    type="text"
                    placeholder="Enter the text to search"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
        </>
    )
}

export default Search;