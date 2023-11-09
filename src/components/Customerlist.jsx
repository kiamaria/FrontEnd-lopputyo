import React, { useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-grid.css";

import moment from 'moment';

export default function Customerlist() {

    const [customers, setCustomers] = useState([]);

    useEffect(() => fetchCustomers, []);

    const fetchCustomers = () => {
        fetch('http://traineeapp.azurewebsites.net/api/customers')
        .then(response => response.json())
        .then(data => setCustomers(data.content))
    }

    const list = [
        {
          field: "firstname",
          sortable: true,
          filter: true
        },
        {
          field: "lastname",
          sortable: true,
          filter: true
        }
      ];
      
    
      console.log(customers);
    
      return (
        <>
    <div
      className="ag-theme-material"
      style={{ height: "700px", width: "70%", margin: "auto" }}
    >
      <AgGridReact 
      columnDefs={list} 
      rowData={customers}>
      </AgGridReact>
    </div>
    </>
      );
    }
    