import { useEffect, useState } from "react";
import "./App.css";
import Table, { TableData } from "./components/Table/Table";

interface Product {
  id: string;
  brand: string;
  category: string;
  discountPercentage: number;
  price: number;
  title: string;
}

interface Column {
  key: keyof Product;
  label: string;
}

function App() {
  const [products, setProducts] = useState<Array<Product>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const columns: Array<Column> = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "title",
      label: "Title",
    },
    {
      key: "brand",
      label: "Brand",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "discountPercentage",
      label: "Discount Percentage",
    },
    {
      key: "price",
      label: "Price",
    },
  ];

  useEffect(() => {
    fetch("https://dummyjson.com/products/?limit=100")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products as Array<Product>);
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      });
  }, []);

  return (
    <div style={{ width: "100%"}}>
      <Table
        columns={columns}
        data={products as unknown as TableData}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
