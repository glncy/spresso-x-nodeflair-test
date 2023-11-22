import React, { useEffect, useState } from "react";
import "./Table.css";

export type TableData = Array<{
  [key: string]: string | number;
}>;

interface TableProps {
  columns: Array<{ key: string; label: string }>;
  data: TableData;
  isLoading?: boolean;
  page?: number;
  search?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, isLoading, page, search: searchValue }) => {
  const [finalData, setFinalData] = useState<TableData>([]);
  const [tableData, setTableData] = useState<TableData>([]);
  const [isAscending, setIsAscending] = useState<boolean>(false);
  const [sortKey, setSortKey] = useState<string>("");
  const [numberOfPages, setNumberOfPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const [searchData, setSearchData] = useState<TableData>([]);
  const [selectedRows, setSelectedRows] = useState<TableData>([]);

  useEffect(() => {
    // delete keys that are not in columns
    const keys = columns.map((column) => column.key);
    const filteredData = data.map((row) => {
      const filteredRow: { [key: string]: string | number } = {};
      keys.forEach((key) => {
        filteredRow[key] = row[key];
      });
      return filteredRow;
    });
    setFinalData(filteredData);

    // set number of pages
    setNumberOfPages(Math.ceil(filteredData.length / rowsPerPage));

    if (page) {
      setCurrentPage(page);
      // set table data based on page
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      setTableData(filteredData.slice(startIndex, endIndex));
    } else {
      // set table data
      setTableData(filteredData.slice(0, rowsPerPage));
    }
  }, [columns, data, page, rowsPerPage]);

  useEffect(() => {
    if (finalData.length === 0) return;
    // set number of pages
    setSearch(searchValue || "");
    if (searchValue) {
      onChangeSearch({ target: { value: searchValue || "" } } as React.ChangeEvent<HTMLInputElement>);
      if (page) {
        setCurrentPage(page);
        // set table data based on page
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        setTableData(searchData.slice(startIndex, endIndex));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, finalData]);

  const onClickHeader = (key: string) => {
    let direction = isAscending ? "descending" : "ascending";
    if (sortKey !== key) {
      direction = "ascending";
      setIsAscending(true);
      setSortKey(key);
    } else {
      setIsAscending(!isAscending);
    }

    const targetData = search ? searchData : finalData;

    const result = targetData.sort((a, b) => {
      if (direction === "ascending") {
        const valueA =
          typeof a[key] === "string"
            ? (a[key] as string).toLowerCase()
            : a[key];
        const valueB =
          typeof b[key] === "string"
            ? (b[key] as string).toLowerCase()
            : b[key];
        // sort string or number ascending
        return valueA > valueB ? 1 : -1;
      } else {
        const valueA =
          typeof a[key] === "string"
            ? (a[key] as string).toLowerCase()
            : a[key];
        const valueB =
          typeof b[key] === "string"
            ? (b[key] as string).toLowerCase()
            : b[key];
        // sort string or number descending
        return valueA < valueB ? 1 : -1;
      }
    });

    if (search) {
      setSearchData(result);
    } else {
      setFinalData(result);
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setTableData(result.slice(startIndex, endIndex));
  };

  const onChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    const filteredData = finalData.filter((row) => {
      return Object.values(row).some((cell) => {
        if (typeof cell === "string") {
          return cell.toLowerCase().includes(value.toLowerCase());
        }
        return false;
      });
    });
    setSearchData(filteredData);
    setTableData(filteredData.slice(0, rowsPerPage));

    // set number of pages
    setNumberOfPages(Math.ceil(filteredData.length / rowsPerPage));
    setCurrentPage(1);
  };

  const onClickPrevious = () => {
    setCurrentPage(currentPage - 1);

    // set table data
    const startIndex = (currentPage - 1 - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    if (search) {
      setTableData(searchData.slice(startIndex, endIndex));
      return;
    }
    setTableData(finalData.slice(startIndex, endIndex));
  };

  const onClickNext = () => {
    setCurrentPage(currentPage + 1);

    // set table data
    const startIndex = (currentPage - 1 + 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    if (search) {
      setTableData(searchData.slice(startIndex, endIndex));
      return;
    }
    setTableData(finalData.slice(startIndex, endIndex));
  };

  const onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const data = finalData.find((row) => row.id == value);
    if (event.target.checked && data) {
      setSelectedRows([...selectedRows, data]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row.id != value));
    }
  };

  return (
    <div className="sp-container">
      <input
        type="text"
        placeholder="Search..."
        onChange={onChangeSearch}
        className="sp-search"
        defaultValue={searchValue}
      />
      <table className="sp-table" border={0} cellSpacing={0}>
        <thead>
          <tr>
            <th>Action</th>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => onClickHeader(column.key)}
                style={{ cursor: "pointer" }}
              >
                {column.label} {sortKey === column.key && isAscending && "▲"}{" "}
                {sortKey === column.key && !isAscending && "▼"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={columns.length + 1}>Loading...</td>
            </tr>
          )}
          {!isLoading &&
            tableData.map((row, index) => (
              <tr key={index}>
                {/* checkbox */}
                <td>
                  <input
                    type="checkbox"
                    onChange={onChangeCheckbox}
                    value={row.id}
                    checked={selectedRows.some(
                      (selectedRow) => selectedRow.id == row.id
                    )}
                    style={{ padding: "24px" }}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key}>
                    {typeof row[column.key] === "number" && column.key !== "id"
                      ? (row[column.key] as number).toFixed(2)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading && tableData.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1}>No data</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="sp-pagination">
        <button disabled={currentPage === 1} onClick={onClickPrevious}>
          Previous
        </button>
        <span>
          {currentPage} of {numberOfPages} pages
        </span>
        <button onClick={onClickNext} disabled={currentPage === numberOfPages}>
          Next
        </button>
      </div>
      {selectedRows.length > 0 && (
        <div className="sp-result">
          {/* show json of selected data */}
          <h3>Result:</h3>
          <pre>{JSON.stringify({ products: selectedRows }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Table;
